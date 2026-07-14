import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { schools, toiletBlocks, users } from "../data/dummyData";
import { brand } from "../theme";

const TYPE_LABEL = { CO_ED: "Co-ed", BOYS_ONLY: "Boys-only", GIRLS_ONLY: "Girls-only" };
const TYPE_COLOR = { CO_ED: brand.main, BOYS_ONLY: brand.boys, GIRLS_ONLY: brand.girls };

export default function SchoolsPage() {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Schools</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {schools.length} schools onboarded in the pilot
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>School</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Toilet blocks</TableCell>
              <TableCell>School admin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.map((s) => {
              const blocks = toiletBlocks.filter((b) => b.schoolId === s.id);
              const admin = users.find((u) => u.role === "SCHOOL_ADMIN" && u.schoolId === s.id);
              return (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={TYPE_LABEL[s.type]} sx={{ bgcolor: TYPE_COLOR[s.type] + "22", color: TYPE_COLOR[s.type], fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>{s.district}</TableCell>
                  <TableCell>
                    {blocks.length} ({blocks.filter((b) => b.gender === "BOYS").length} boys / {blocks.filter((b) => b.gender === "GIRLS").length} girls)
                  </TableCell>
                  <TableCell>{admin?.name || "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
