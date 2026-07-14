import { useMemo, useState } from "react";
import {
  Box, Card, Typography, Stack, FormControl, InputLabel, Select, MenuItem, Chip, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel,
} from "@mui/material";
import { Close, CheckCircle, Cancel, ZoomIn } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import {
  ROLES, toiletBlocks, toiletInventory, schools, getSchoolById, getBlocksForCleaner,
  schoolIdsForUser, districtsInScope, todayDate,
} from "../data/dummyData";
import { brand } from "../theme";

const CAN_EDIT_ROLES = [ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR, ROLES.CLEANER];

// One fixed representative photo per facility type.
const FACILITY_PHOTOS = {
  westernSeats: "https://thumbs.dreamstime.com/b/indian-westrn-toilet-bathroom-indian-western-toilet-bathroom-open-condition-166865754.jpg",
  indianSeats: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu6j275pKlYTXyumPDEEGe9Xk0_Exclyzm8uDH5ssY5w&s=10",
  urinals: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrOvKHK0KkXb_PkwTqZDJTOmaoiQV18oip19wQOF1Lvw&s=10",
  buckets: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkyWukSSIeLwMFECS9cnw65CbqNEQJdVTIavd4UBHF4w&s=10",
  taps: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHtNOgU0qo4QXaJnROQOeh_Fzqld921_NbSwoXPXm6Ug&s=10",
  rampAccess: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScpKcndL9ulhke9yfeQE4RNlZx_kHOZsFs1zw4faSszQ&s=10",
  sanitaryVendingMachine: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZP9C7ly4sYUF4jUZYNhBsRNFo8xGbritkVDVG5r6tvyjaTYM1ooNH5cM&s=10",
};

export default function InventoryPage() {
  const { currentUser } = useAuth();
  const isCleaner = currentUser?.role === ROLES.CLEANER;
  const baseSchoolIds = schoolIdsForUser(currentUser);
  const baseSchools = schools.filter((s) => baseSchoolIds.includes(s.id));
  const baseDistricts = useMemo(
    () => [...districtsInScope(baseSchoolIds)].sort((a, b) => a.localeCompare(b)),
    [baseSchoolIds]
  );
  const showLocationFilters = baseSchoolIds.length > 1;
  const canEdit = CAN_EDIT_ROLES.includes(currentUser?.role);

  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [schoolFilter, setSchoolFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("LATEST");

  const [inventory, setInventory] = useState(() =>
    Object.fromEntries(toiletInventory.map((inv) => [inv.toiletBlockId, inv]))
  );
  const [detailsBlockId, setDetailsBlockId] = useState(null);
  const [editingBlockId, setEditingBlockId] = useState(null);

  const handleDistrictChange = (value) => {
    setDistrictFilter(value);
    setSchoolFilter("ALL");
  };

  const schoolsAfterDistrict = districtFilter === "ALL" ? baseSchools : baseSchools.filter((s) => s.district === districtFilter);

  const scopedBlocks = isCleaner
    ? getBlocksForCleaner(currentUser.id)
    : toiletBlocks.filter((b) => {
        const inSchool = schoolFilter !== "ALL" ? b.schoolId === Number(schoolFilter) : schoolsAfterDistrict.some((s) => s.id === b.schoolId);
        return inSchool;
      });

  const rows = scopedBlocks
    .filter((b) => genderFilter === "ALL" || b.gender === genderFilter)
    .map((block) => ({ block, school: getSchoolById(block.schoolId) }))
    .sort((a, b) => {
      const dateA = inventory[a.block.id].updatedAt;
      const dateB = inventory[b.block.id].updatedAt;
      return sortOrder === "LATEST" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });

  const detailsRow = rows.find((r) => r.block.id === detailsBlockId) ?? null;
  const editingBlock = rows.find((r) => r.block.id === editingBlockId)?.block ?? null;

  const handleSave = (blockId, updated) => {
    setInventory((prev) => ({
      ...prev,
      [blockId]: { ...prev[blockId], ...updated, updatedAt: todayDate, updatedByUserId: currentUser.id },
    }));
    setEditingBlockId(null);
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5, justifyContent: "flex-end", mb: 2 }}>
        {showLocationFilters && (
          <>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>District</InputLabel>
              <Select label="District" value={districtFilter} onChange={(e) => handleDistrictChange(e.target.value)}>
                <MenuItem value="ALL">All districts</MenuItem>
                {baseDistricts.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>School</InputLabel>
              <Select label="School" value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
                <MenuItem value="ALL">All schools</MenuItem>
                {schoolsAfterDistrict.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Gender</InputLabel>
          <Select label="Gender" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <MenuItem value="ALL">All blocks</MenuItem>
            <MenuItem value="BOYS">Boys</MenuItem>
            <MenuItem value="GIRLS">Girls</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Updated</InputLabel>
          <Select label="Updated" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <MenuItem value="LATEST">Latest updated first</MenuItem>
            <MenuItem value="OLDEST">Oldest updated first</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {rows.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No toilet blocks in the selected scope.</Typography>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 0 }}>
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": { py: 0.5, fontSize: 13 },
              "& .MuiTableCell-head": { fontSize: 12, fontWeight: 700 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>District</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Block</TableCell>
                <TableCell>Last updated</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ block, school }) => {
                const inv = inventory[block.id];
                return (
                  <TableRow key={block.id} hover>
                    <TableCell>{school.district}</TableCell>
                    <TableCell>{school.name}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{block.blockName}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(inv.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" onClick={() => setDetailsBlockId(block.id)}>View Details</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <InventoryDetailDialog
        row={detailsRow}
        inv={detailsRow ? inventory[detailsRow.block.id] : null}
        canEdit={canEdit}
        onClose={() => setDetailsBlockId(null)}
        onEdit={() => {
          setEditingBlockId(detailsRow.block.id);
          setDetailsBlockId(null);
        }}
      />

      <InventoryEditDialog
        block={editingBlock}
        inv={editingBlock ? inventory[editingBlock.id] : null}
        onClose={() => setEditingBlockId(null)}
        onSave={handleSave}
      />
    </Box>
  );
}

function InventoryDetailDialog({ row, inv, canEdit, onClose, onEdit }) {
  const [preview, setPreview] = useState(null);
  const isGirls = row?.block.gender === "GIRLS";

  const facilityRows = row && inv ? [
    { key: "westernSeats", label: "Western seats", value: inv.westernSeats, available: true },
    { key: "indianSeats", label: "Indian seats", value: inv.indianSeats, available: true },
    { key: "urinals", label: "Urinals", value: inv.urinals, available: !isGirls },
    { key: "buckets", label: "Buckets", value: inv.buckets, available: true },
    { key: "taps", label: "Taps", value: inv.taps, available: true },
    { key: "rampAccess", label: "Ramp access", value: <AvailabilityBadge available={inv.rampAccess} />, available: true },
    { key: "sanitaryVendingMachine", label: "Vending machine", value: <AvailabilityBadge available={inv.sanitaryVendingMachine} />, available: isGirls },
  ].filter((f) => f.available) : [];

  if (!row || !inv) return null;
  const { block, school } = row;

  return (
    <>
      <Dialog open={!!row} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography fontWeight={700}>{block.blockName}</Typography>
            <Typography variant="body2" color="text.secondary">{school.name} · {school.district}</Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip
              size="small"
              label={isGirls ? "Girls" : "Boys"}
              sx={{ bgcolor: (isGirls ? brand.girls : brand.boys) + "22", color: isGirls ? brand.girls : brand.boys, fontWeight: 600 }}
            />
            <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": { py: 0.75, fontSize: 13 },
              "& .MuiTableCell-head": { fontSize: 12, fontWeight: 700 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Facility</TableCell>
                <TableCell>Photo</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facilityRows.map((f) => {
                const photo = { url: FACILITY_PHOTOS[f.key] };
                return (
                  <TableRow key={f.key}>
                    <TableCell sx={{ fontWeight: 600 }}>{f.label}</TableCell>
                    <TableCell>
                      <PhotoThumb
                        photo={photo}
                        label={f.label}
                        size={44}
                        onClick={() => setPreview({ ...photo, caption: `${block.blockName} — ${f.label}` })}
                      />
                    </TableCell>
                    <TableCell>{f.value}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary">
            Last updated {new Date(inv.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </Typography>
        </DialogContent>
        {canEdit && (
          <DialogActions>
            <Button variant="contained" disableElevation sx={{ bgcolor: brand.main, "&:hover": { bgcolor: brand.mainDark } }} onClick={onEdit}>
              Edit
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md">
        {preview && (
          <Box sx={{ position: "relative", bgcolor: "#000" }}>
            <IconButton onClick={() => setPreview(null)} sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "#fff" } }} size="small">
              <Close fontSize="small" />
            </IconButton>
            <Box component="img" src={preview.url} alt={preview.caption} sx={{ display: "block", maxWidth: "90vw", maxHeight: "80vh" }} />
            <Typography variant="caption" sx={{ position: "absolute", bottom: 8, left: 12, color: "#fff", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              {preview.caption}
            </Typography>
          </Box>
        )}
      </Dialog>
    </>
  );
}

function PhotoThumb({ photo, label, onClick, size = 44 }) {
  if (!photo) return null;
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative", width: size, height: size, overflow: "hidden", cursor: "pointer", flexShrink: 0,
        border: "1px solid #E5E7EB",
        "&:hover .zoom-overlay": { opacity: 1 },
      }}
    >
      <Box component="img" src={photo.url} alt={label} loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <Box className="zoom-overlay" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.25)", opacity: 0, transition: "opacity 0.15s", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <ZoomIn sx={{ color: "#fff", fontSize: Math.max(14, size * 0.3) }} />
      </Box>
    </Box>
  );
}

function AvailabilityBadge({ available }) {
  if (available === null || available === undefined) {
    return <Typography variant="body2" color="text.disabled">—</Typography>;
  }
  return available ? (
    <Stack direction="row" spacing={0.4} sx={{ alignItems: "center", color: brand.mainDark }}>
      <CheckCircle sx={{ fontSize: 15 }} /> <Typography variant="body2" fontWeight={700}>Yes</Typography>
    </Stack>
  ) : (
    <Stack direction="row" spacing={0.4} sx={{ alignItems: "center", color: brand.critical }}>
      <Cancel sx={{ fontSize: 15 }} /> <Typography variant="body2" fontWeight={700}>No</Typography>
    </Stack>
  );
}

function InventoryEditDialog({ block, inv, onClose, onSave }) {
  const [form, setForm] = useState(null);

  // Reset the draft whenever a different block is opened for editing.
  if (block && (!form || form.blockId !== block.id)) {
    setForm({ blockId: block.id, ...inv });
  }
  if (!block && form) {
    setForm(null);
  }

  if (!block || !form) return null;
  const isGirls = block.gender === "GIRLS";

  const setField = (field) => (e) => {
    const value = e.target.type === "number" ? Math.max(0, Number(e.target.value)) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const { blockId, ...updated } = form;
    onSave(blockId, updated);
  };

  return (
    <Dialog open={!!block} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography fontWeight={700}>{block.blockName}</Typography>
          <Typography variant="body2" color="text.secondary">Update facility counts</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField label="Western seats" type="number" size="small" fullWidth value={form.westernSeats} onChange={setField("westernSeats")} slotProps={{ htmlInput: { min: 0 } }} />
            <TextField label="Indian seats" type="number" size="small" fullWidth value={form.indianSeats} onChange={setField("indianSeats")} slotProps={{ htmlInput: { min: 0 } }} />
          </Stack>
          {!isGirls && (
            <TextField label="Urinals" type="number" size="small" fullWidth value={form.urinals} onChange={setField("urinals")} slotProps={{ htmlInput: { min: 0 } }} />
          )}
          <Stack direction="row" spacing={2}>
            <TextField label="Buckets" type="number" size="small" fullWidth value={form.buckets} onChange={setField("buckets")} slotProps={{ htmlInput: { min: 0 } }} />
            <TextField label="Taps" type="number" size="small" fullWidth value={form.taps} onChange={setField("taps")} slotProps={{ htmlInput: { min: 0 } }} />
          </Stack>
          <FormControlLabel
            control={<Switch checked={!!form.rampAccess} onChange={(e) => setForm((prev) => ({ ...prev, rampAccess: e.target.checked }))} />}
            label="Ramp / handicap accessibility"
          />
          {isGirls && (
            <FormControlLabel
              control={<Switch checked={!!form.sanitaryVendingMachine} onChange={(e) => setForm((prev) => ({ ...prev, sanitaryVendingMachine: e.target.checked }))} />}
              label="Sanitary napkin vending machine"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disableElevation sx={{ bgcolor: brand.main, "&:hover": { bgcolor: brand.mainDark } }} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
