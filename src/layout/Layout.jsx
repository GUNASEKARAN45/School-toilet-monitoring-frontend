import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { brand } from "../theme";

const drawerWidth = 230;

export default function Layout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideBar />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: `calc(100% - ${drawerWidth}px)`,
          backgroundColor: brand.contentBg,
        }}
      >
        <TopBar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: "60px" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
