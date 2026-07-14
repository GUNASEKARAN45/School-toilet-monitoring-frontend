import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  Dashboard, School, Wc, CleaningServices, ReportProblem, Groups, FiberManualRecord,
} from "@mui/icons-material";
import { MENU } from "../menu";
import { useAuth } from "../context/AuthContext";
import { brand } from "../theme";

const drawerWidth = 230;

const iconMap = {
  Dashboard: <Dashboard />,
  School: <School />,
  Wc: <Wc />,
  CleaningServices: <CleaningServices />,
  ReportProblem: <ReportProblem />,
  Groups: <Groups />,
};

export default function SideBar() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const items = MENU.filter((m) => m.roles.includes(currentUser?.role));

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: brand.sidebar,
          borderRight: "none",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "8px", background: brand.main, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          🏫
        </Box>
        <Box sx={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
          Scrapify<br />
          <Box component="span" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 11.5 }}>
            School Toilet Monitoring
          </Box>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 2, mb: 1.5 }} />

      <List sx={{ px: 1 }}>
        {items.map((route) => {
          const isSelected = route.path === location.pathname;
          return (
            <ListItem key={route.text} disablePadding sx={{ display: "block", mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={route.path}
                selected={isSelected}
                sx={{
                  borderRadius: "8px",
                  color: isSelected ? "#fff" : "rgba(255,255,255,0.7)",
                  "&.Mui-selected": {
                    backgroundColor: brand.main + "22",
                    color: "#fff",
                    "& .MuiListItemIcon-root": { color: brand.main },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    "& .MuiListItemIcon-root": { color: brand.main },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isSelected ? brand.main : "rgba(255,255,255,0.5)" }}>
                  {iconMap[route.icon] || <FiberManualRecord sx={{ fontSize: 10 }} />}
                </ListItemIcon>
                <ListItemText
                  primary={route.text}
                  slotProps={{ primary: { fontSize: "0.82rem", fontWeight: isSelected ? 600 : 500 } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
