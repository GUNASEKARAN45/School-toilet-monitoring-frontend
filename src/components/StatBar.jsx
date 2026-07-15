import { Card, Typography, Box, Stack } from "@mui/material";

export default function StatBar({ stats }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          variant="outlined"
          sx={{
            flex: "1 1 200px",
            p: 1.75,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          {stat.icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${stat.accent || "#3CC179"}1A`,
                color: stat.accent || "#3CC179",
              }}
            >
              {stat.icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
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
        </Card>
      ))}
    </Stack>
  );
}
