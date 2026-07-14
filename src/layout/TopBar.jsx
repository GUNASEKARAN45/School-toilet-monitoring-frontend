import { AppBar, Avatar, Box, Chip, Toolbar, Typography, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, getSchoolById, schoolIdsForUser } from "../data/dummyData";
import { useNavigate } from "react-router-dom";

const drawerWidth = 230;

export default function TopBar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const schoolIds = schoolIdsForUser(currentUser);
  const scopeLabel =
    currentUser?.role === "SUPER_ADMIN"
      ? "All schools"
      : schoolIds.length > 1
      ? `${schoolIds.length} schools`
      : schoolIds[0]
      ? getSchoolById(schoolIds[0])?.name
      : "";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: "#fff",
        color: "#111827",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <Toolbar sx={{ minHeight: "60px !important", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {scopeLabel}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: "#3CC179" }}>
            {currentUser?.name?.[0] || "?"}
          </Avatar>
          <Box sx={{ lineHeight: 1.1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentUser?.name}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{ROLE_LABELS[currentUser?.role]}</Typography>
          </Box>
          <Button size="small" onClick={() => { logout(); navigate("/login"); }}>
            Switch role
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
