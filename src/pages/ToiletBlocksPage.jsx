import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { toiletBlocks, getSchoolById, schoolIdsForUser } from "../data/dummyData";
import { brand } from "../theme";

export default function ToiletBlocksPage() {
  const { currentUser } = useAuth();
  const schoolIds = schoolIdsForUser(currentUser);
  const blocks = toiletBlocks.filter((b) => schoolIds.includes(b.schoolId));

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Toilet Blocks</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{blocks.length} blocks in your scope</Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Block</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>QR code</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{b.blockName}</TableCell>
                <TableCell>{getSchoolById(b.schoolId)?.name}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={b.gender === "BOYS" ? "Boys" : "Girls"}
                    sx={{ bgcolor: (b.gender === "BOYS" ? brand.boys : brand.girls) + "22", color: b.gender === "BOYS" ? brand.boys : brand.girls, fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>{b.floor}</TableCell>
                <TableCell>{b.seats}</TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" label={`QR-SCH${b.schoolId}-BLK${b.id}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
