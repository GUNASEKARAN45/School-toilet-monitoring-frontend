import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getSchoolById, schoolIdsForUser, WELCOME_NAMES } from "../data/dummyData";
import { useNavigate, useLocation } from "react-router-dom";
import { MENU } from "../menu";
import { brand } from "../theme";

const drawerWidth = 230;

export default function TopBar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const schoolIds = schoolIdsForUser(currentUser);
  const scopeLabel =
    currentUser?.role === "SUPER_ADMIN"
      ? "All schools"
      : schoolIds.length > 1
      ? `${schoolIds.length} schools`
      : schoolIds[0]
      ? getSchoolById(schoolIds[0])?.name
      : "";
  const pageTitle = MENU.find((item) => item.path === location.pathname)?.text ?? scopeLabel;
  const welcomeName = WELCOME_NAMES[currentUser?.id] ?? currentUser?.name;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: "#fff",
        color: "#111827",
        borderBottom: "1px solid #EAECF0",
      }}
    >
      <Toolbar sx={{ minHeight: "60px !important", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {pageTitle}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Welcome, {welcomeName}
          </Typography>
          <Button
            size="small"
            variant="contained"
            disableElevation
            onClick={() => { logout(); navigate("/login"); }}
            sx={{ bgcolor: brand.critical, color: "#fff", "&:hover": { bgcolor: "#b23030" } }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
