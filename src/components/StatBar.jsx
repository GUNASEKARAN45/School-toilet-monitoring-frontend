import { Card, Typography, Box, Stack, Divider } from "@mui/material";

export default function StatBar({ stats }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "#E5E7EB" }}>
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ flexWrap: "wrap" }}>
        {stats.map((stat) => (
          <Box key={stat.label} sx={{ flex: "1 1 140px", py: 1.25, px: 2 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, color: "text.secondary", fontSize: "0.65rem" }}
            >
              {stat.label}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.4, color: stat.valueColor || "text.primary" }}>
              {stat.value}
            </Typography>
            {stat.sub && (
              <Typography variant="caption" sx={{ display: "block", fontSize: "0.7rem", color: stat.subColor || "text.secondary", fontWeight: stat.subColor ? 700 : 500 }}>
                {stat.sub}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
