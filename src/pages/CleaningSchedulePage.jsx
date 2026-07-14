import { useState } from "react";
import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  SHIFTS, ROLES, cleaningLogs, todayDate, getSchoolById,
  toiletBlocks, schoolIdsForUser, getBlocksForCleaner,
} from "../data/dummyData";
import { brand } from "../theme";

const STATUS_STYLE = {
  DONE: { bg: "#E6F7EA", color: brand.mainDark, label: "Done" },
  PENDING: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  MISSED: { bg: "#FDE8E8", color: brand.critical, label: "Missed" },
};

export default function CleaningSchedulePage() {
  const { currentUser } = useAuth();
  const isCleaner = currentUser?.role === ROLES.CLEANER;
  const schoolIds = schoolIdsForUser(currentUser);

  const scopedBlocks = isCleaner
    ? getBlocksForCleaner(currentUser.id)
    : toiletBlocks.filter((b) => schoolIds.includes(b.schoolId));

  const [logs, setLogs] = useState(
    cleaningLogs.filter((l) => l.date === todayDate && scopedBlocks.some((b) => b.id === l.toiletBlockId))
  );

  const markDone = (logId) => {
    setLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, status: "DONE", cleanedByUserId: currentUser.id } : l)));
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        {isCleaner ? "My Cleaning Tasks — Today" : "Cleaning Schedule — Today"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {new Date(todayDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Block</TableCell>
              {!isCleaner && <TableCell>School</TableCell>}
              <TableCell>Shift</TableCell>
              <TableCell>Status</TableCell>
              {isCleaner && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {logs
              .sort((a, b) => a.shiftId - b.shiftId)
              .map((log) => {
                const block = scopedBlocks.find((b) => b.id === log.toiletBlockId);
                const shift = SHIFTS.find((s) => s.id === log.shiftId);
                const style = STATUS_STYLE[log.status];
                return (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{block?.blockName}</TableCell>
                    {!isCleaner && <TableCell>{getSchoolById(block?.schoolId)?.name}</TableCell>}
                    <TableCell>{shift?.label} <Typography component="span" variant="caption" color="text.secondary">({shift?.start}–{shift?.end})</Typography></TableCell>
                    <TableCell>
                      <Chip size="small" label={style.label} sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600 }} />
                    </TableCell>
                    {isCleaner && (
                      <TableCell>
                        {log.status !== "DONE" ? (
                          <Button size="small" variant="contained" sx={{ bgcolor: brand.main, "&:hover": { bgcolor: brand.mainDark } }} onClick={() => markDone(log.id)}>
                            Mark done
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Completed</Typography>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
