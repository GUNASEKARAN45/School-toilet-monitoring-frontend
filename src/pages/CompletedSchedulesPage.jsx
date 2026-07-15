import { useEffect, useMemo, useState } from "react";
import {
  Box, Card, Typography, Stack, FormControl, InputLabel, Select, MenuItem,
  TextField, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Button,
} from "@mui/material";
import { Close, ZoomIn } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import {
  SHIFTS, schools, toiletBlocks, cleaningLogs, schoolIdsForUser, districtsInScope,
  getSchoolById, earliestDate, todayDate, recentDays, DATE_RANGES, getDatesForRange,
} from "../data/dummyData";
import { brand, SHIFT_COLORS } from "../theme";

// Cap how many unique photos a dialog asks the photo-server for — a full-month range on one
// block can add up to 90 completed shift-slots; the pool is cycled, so it doesn't need to be
// that large to still look varied.
const PHOTO_POOL_CAP = 120;

// Fetches presigned S3 photo URLs from the local photo-server (School/backend/photo-server) —
// the AWS key never touches the browser. Only fires once a block's dialog is opened.
function usePhotoPool(size, key) {
  const [state, setState] = useState({ status: "idle", photos: [] });

  useEffect(() => {
    if (!key || size <= 0) {
      setState({ status: "idle", photos: [] });
      return;
    }
    let cancelled = false;
    setState({ status: "loading", photos: [] });
    fetch(`/api/random-photos?count=${size}`)
      .then((r) => {
        if (!r.ok) throw new Error("photo-server error");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", photos: data.photos ?? [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", photos: [] });
      });
    return () => { cancelled = true; };
  }, [size, key]);

  return state;
}

function scheduleCounts(blockId, dates, shiftIdx) {
  let scheduled = 0;
  let completed = 0;
  dates.forEach((date) => {
    SHIFTS.forEach((shift, i) => {
      if (shiftIdx !== -1 && i !== shiftIdx) return;
      const log = cleaningLogs.find((l) => l.toiletBlockId === blockId && l.shiftId === shift.id && l.date === date);
      if (log) {
        scheduled += 1;
        if (log.status === "DONE") completed += 1;
      }
    });
  });
  return { scheduled, completed };
}

export default function CompletedSchedulesPage() {
  const { currentUser } = useAuth();
  const baseSchoolIds = schoolIdsForUser(currentUser);
  const baseSchools = schools.filter((s) => baseSchoolIds.includes(s.id));
  const baseDistricts = districtsInScope(baseSchoolIds);
  const showLocationFilters = baseSchoolIds.length > 1;

  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [schoolFilter, setSchoolFilter] = useState("ALL");
  const [rangeKey, setRangeKey] = useState("TODAY");
  const [customFrom, setCustomFrom] = useState(recentDays[recentDays.length - 7]);
  const [customTo, setCustomTo] = useState(todayDate);
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [dialogBlockId, setDialogBlockId] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleDistrictChange = (value) => {
    setDistrictFilter(value);
    setSchoolFilter("ALL");
  };

  const schoolsAfterDistrict = districtFilter === "ALL" ? baseSchools : baseSchools.filter((s) => s.district === districtFilter);
  const scopedSchoolIds = useMemo(
    () => (schoolFilter !== "ALL" ? [Number(schoolFilter)] : schoolsAfterDistrict.map((s) => s.id)),
    [schoolFilter, schoolsAfterDistrict]
  );
  const scopedBlocks = useMemo(
    () => toiletBlocks.filter((b) => scopedSchoolIds.includes(b.schoolId)),
    [scopedSchoolIds]
  );
  const dates = useMemo(() => getDatesForRange(rangeKey, customFrom, customTo), [rangeKey, customFrom, customTo]);
  const shiftIdx = shiftFilter === "ALL" ? -1 : SHIFTS.findIndex((s) => String(s.id) === shiftFilter);

  // One row per block, summarising the whole selected date range — the View dialog is where the
  // per-day, per-shift breakdown lives.
  const rows = useMemo(() => {
    return scopedBlocks
      .map((block) => ({ block, school: getSchoolById(block.schoolId), ...scheduleCounts(block.id, dates, shiftIdx) }))
      .filter((r) => r.completed > 0)
      .sort((a, b) => a.school.name.localeCompare(b.school.name) || a.block.blockName.localeCompare(b.block.blockName));
  }, [scopedBlocks, dates, shiftIdx]);

  const dialogRow = rows.find((r) => r.block.id === dialogBlockId) ?? null;

  const sortedDistricts = useMemo(() => [...baseDistricts].sort((a, b) => a.localeCompare(b)), [baseDistricts]);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5, justifyContent: "flex-end", mb: 2 }}>
        {showLocationFilters && (
          <>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>District</InputLabel>
              <Select label="District" value={districtFilter} onChange={(e) => handleDistrictChange(e.target.value)}>
                <MenuItem value="ALL">All districts</MenuItem>
                {sortedDistricts.map((d) => (
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Date range</InputLabel>
          <Select label="Date range" value={rangeKey} onChange={(e) => setRangeKey(e.target.value)}>
            {Object.entries(DATE_RANGES).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {rangeKey === "CUSTOM" && (
          <>
            <TextField
              label="From" type="date" size="small" value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: earliestDate, max: customTo } }}
              sx={{ width: 155 }}
            />
            <TextField
              label="To" type="date" size="small" value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: customFrom, max: todayDate } }}
              sx={{ width: 155 }}
            />
          </>
        )}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Shift</InputLabel>
          <Select label="Shift" value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}>
            <MenuItem value="ALL">All shifts</MenuItem>
            {SHIFTS.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {rows.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No completed schedules for this range in the selected scope.</Typography>
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
                <TableCell align="center">Total Scheduled</TableCell>
                <TableCell align="center">Total Completed</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.block.id} hover>
                  <TableCell>{row.school.district}</TableCell>
                  <TableCell>{row.school.name}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.block.blockName}</TableCell>
                  <TableCell align="center">{row.scheduled}</TableCell>
                  <TableCell
                    align="center"
                    sx={row.completed < row.scheduled ? { color: brand.critical, fontWeight: 700 } : undefined}
                  >
                    {row.completed}
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => setDialogBlockId(row.block.id)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ScheduleDetailDialog row={dialogRow} dates={dates} shiftIdx={shiftIdx} onClose={() => setDialogBlockId(null)} onPreview={setPreview} />

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
    </Box>
  );
}

function ScheduleDetailDialog({ row, dates, shiftIdx, onClose, onPreview }) {
  // Every (date, shift) slot in range, most recent date first — including MISSED/PENDING ones,
  // which get a status badge instead of photos.
  const dateGroups = useMemo(() => {
    if (!row) return [];
    const groups = [];
    [...dates].sort((a, b) => b.localeCompare(a)).forEach((date) => {
      const shiftsForDate = SHIFTS.filter((shift, i) => shiftIdx === -1 || i === shiftIdx).map((shift) => {
        const log = cleaningLogs.find((l) => l.toiletBlockId === row.block.id && l.shiftId === shift.id && l.date === date);
        return { ...shift, status: log?.status ?? "PENDING" };
      });
      if (shiftsForDate.length) groups.push({ date, shifts: shiftsForDate });
    });
    return groups;
  }, [row, dates, shiftIdx]);

  const doneSlotCount = dateGroups.reduce((sum, g) => sum + g.shifts.filter((s) => s.status === "DONE").length, 0);
  const poolSize = Math.min(doneSlotCount * 4, PHOTO_POOL_CAP);
  const photoState = usePhotoPool(poolSize, row?.block.id);

  // Hand each completed (date, shift) slot 2 "before" + 2 "after" photos, cycling through the pool.
  const photoAssignments = useMemo(() => {
    if (photoState.status !== "ready" || !photoState.photos.length) return {};
    const pool = photoState.photos;
    const map = {};
    let idx = 0;
    dateGroups.forEach((g) => {
      g.shifts.forEach((shift) => {
        if (shift.status !== "DONE") return;
        map[`${g.date}-${shift.id}`] = {
          before: [pool[idx % pool.length], pool[(idx + 1) % pool.length]],
          after: [pool[(idx + 2) % pool.length], pool[(idx + 3) % pool.length]],
        };
        idx += 4;
      });
    });
    return map;
  }, [dateGroups, photoState]);

  if (!row) return null;

  return (
    <Dialog open={!!row} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography fontWeight={700}>{row.block.blockName}</Typography>
          <Typography variant="body2" color="text.secondary">{row.school.name} · {row.school.district}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {photoState.status === "error" && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Couldn't reach the photo server — start it with <code>npm start</code> in <code>School/backend/photo-server</code> (see its .env.example).
          </Alert>
        )}
        {photoState.status === "loading" ? (
          <Stack sx={{ alignItems: "center", justifyContent: "center", height: 120 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": { py: 0.75, fontSize: 13 },
              "& .MuiTableCell-head": { fontSize: 12, fontWeight: 700 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Before</TableCell>
                <TableCell>After</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dateGroups.map((g) =>
                g.shifts.map((shift, i) => {
                  const pair = photoAssignments[`${g.date}-${shift.id}`];
                  const isDone = shift.status === "DONE";
                  return (
                    <TableRow key={`${g.date}-${shift.id}`} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {i === 0
                          ? new Date(g.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                          : ""}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: SHIFT_COLORS[shift.label] }} />
                          <Typography variant="caption" fontWeight={600}>{shift.label}</Typography>
                        </Stack>
                      </TableCell>
                      {isDone ? (
                        <>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              {(pair?.before ?? [null, null]).map((photo, j) => (
                                <PhotoThumb key={`b${j}`} photo={photo} label="Before" size={44}
                                  onClick={() => photo && onPreview({ ...photo, caption: `${row.block.blockName} — ${shift.label} — ${g.date} — Before ${j + 1}` })} />
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              {(pair?.after ?? [null, null]).map((photo, j) => (
                                <PhotoThumb key={`a${j}`} photo={photo} label="After" size={44}
                                  onClick={() => photo && onPreview({ ...photo, caption: `${row.block.blockName} — ${shift.label} — ${g.date} — After ${j + 1}` })} />
                              ))}
                            </Stack>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={2}>
                          <StatusBadge status={shift.status} />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }) {
  const isMissed = status === "MISSED";
  const color = isMissed ? brand.critical : brand.muted;
  return (
    <Box
      sx={{
        display: "inline-block",
        fontSize: "0.7rem",
        fontWeight: 700,
        color,
        bgcolor: `${color}1A`,
        border: `1px solid ${color}44`,
        borderRadius: 5,
        px: 1,
        py: 0.3,
      }}
    >
      {isMissed ? "Missed" : "Pending"}
    </Box>
  );
}

function PhotoThumb({ photo, label, onClick, size = 100 }) {
  const height = Math.round(size * 0.84);
  if (!photo) {
    return <Box sx={{ width: size, height, bgcolor: "#F3F4F6", flexShrink: 0 }} />;
  }
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative", width: size, height, overflow: "hidden", cursor: "pointer", flexShrink: 0,
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
