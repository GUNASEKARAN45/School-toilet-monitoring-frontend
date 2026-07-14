import { Card, Typography, Box } from "@mui/material";

export default function StatTile({ label, value, sub, subColor, accentColor, icon }) {
  return (
    <Card
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderTop: accentColor ? `3px solid ${accentColor}` : undefined,
        background: accentColor ? `linear-gradient(180deg, ${accentColor}14 0%, transparent 70%)` : undefined,
      }}
      elevation={0}
      variant="outlined"
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
        {icon && (
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: accentColor ? `${accentColor}22` : "action.hover",
              color: accentColor || "text.secondary",
              flex: "none",
              "& svg": { fontSize: 14 },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.7rem" }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, lineHeight: 1.1, color: accentColor || "text.primary" }}>
        {value}
      </Typography>
      {sub && (
        <Box sx={{ mt: 0.4 }}>
          <Typography variant="caption" sx={{ color: subColor || "text.disabled", fontWeight: subColor ? 700 : 500, fontSize: "0.68rem" }}>
            {sub}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
