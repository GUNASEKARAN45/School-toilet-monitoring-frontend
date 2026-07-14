import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { users, ROLE_LABELS, getSchoolById, schoolIdsForUser } from "../data/dummyData";
import { brand } from "../theme";

export default function StaffPage() {
  const { currentUser } = useAuth();
  const schoolIds = schoolIdsForUser(currentUser);
  const scoped = users.filter((u) => {
    if (u.role === "SUPER_ADMIN" || u.role === "SUPERVISOR") return true;
    return schoolIds.includes(u.schoolId);
  });

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Staff</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{scoped.length} accounts in your scope</Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Scope</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scoped.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                <TableCell>
                  <Chip size="small" label={ROLE_LABELS[u.role]} sx={{ bgcolor: brand.main + "22", color: brand.mainDark, fontWeight: 600 }} />
                </TableCell>
                <TableCell>
                  {u.role === "SUPER_ADMIN" ? "All schools" : u.coversSchoolIds ? `${u.coversSchoolIds.length} schools` : getSchoolById(u.schoolId)?.name}
                </TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.email || <Typography variant="caption" color="text.secondary">mobile-only login</Typography>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
