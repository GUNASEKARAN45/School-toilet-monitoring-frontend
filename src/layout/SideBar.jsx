import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  Dashboard, School, Wc, ReportProblem, Groups, FiberManualRecord, PhotoLibrary, Inventory2,
} from "@mui/icons-material";
import { MENU } from "../menu";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../data/dummyData";
import { brand } from "../theme";

const drawerWidth = 230;

const iconMap = {
  Dashboard: <Dashboard />,
  School: <School />,
  Wc: <Wc />,
  ReportProblem: <ReportProblem />,
  Groups: <Groups />,
  PhotoLibrary: <PhotoLibrary />,
  Inventory2: <Inventory2 />,
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
          background: `linear-gradient(180deg, ${brand.sidebar} 0%, ${brand.sidebarDark} 100%)`,
          borderRight: "none",
          boxShadow: "2px 0 10px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "9px", background: `linear-gradient(135deg, ${brand.main}, ${brand.mainDark})`, boxShadow: `0 2px 8px ${brand.main}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
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

      <List sx={{ px: 1, flexGrow: 1 }}>
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
                  slotProps={{ primary: { sx: { fontSize: "0.74rem", fontWeight: isSelected ? 600 : 500 } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 2, mb: 1.5 }} />

      <Box sx={{ p: 2, pt: 0.5, display: "flex", alignItems: "center", gap: 1.25 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: brand.main }}>
          {currentUser?.name?.[0] || "?"}
        </Avatar>
        <Box sx={{ lineHeight: 1.1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ color: "#fff", fontWeight: 600, fontSize: "0.8rem" }}>
            {currentUser?.name}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: "rgba(255,255,255,0.5)", display: "block" }}>
            {ROLE_LABELS[currentUser?.role]}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
