import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RoleRoute from "./components/RoleRoute";
import Layout from "./layout/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SchoolsPage from "./pages/SchoolsPage";
import ToiletBlocksPage from "./pages/ToiletBlocksPage";
import CleaningSchedulePage from "./pages/CleaningSchedulePage";
import StaffPage from "./pages/StaffPage";
import { ROLES } from "./data/dummyData";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RoleRoute><Layout /></RoleRoute>}>
              <Route
                path="/"
                element={
                  <RoleRoute allowed={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR, ROLES.CLEANER]}>
                    <DashboardRedirect />
                  </RoleRoute>
                }
              />
              <Route path="/schools" element={<RoleRoute allowed={[ROLES.SUPER_ADMIN]}><SchoolsPage /></RoleRoute>} />
              <Route path="/toilet-blocks" element={<RoleRoute allowed={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR]}><ToiletBlocksPage /></RoleRoute>} />
              <Route path="/cleaning-schedule" element={<RoleRoute allowed={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR, ROLES.CLEANER]}><CleaningSchedulePage /></RoleRoute>} />
              <Route path="/staff" element={<RoleRoute allowed={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]}><StaffPage /></RoleRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Cleaners land straight on their task list instead of the KPI dashboard.
function DashboardRedirect() {
  const { currentUser } = useAuth();
  if (currentUser?.role === ROLES.CLEANER) return <Navigate to="/cleaning-schedule" replace />;
  return <DashboardPage />;
}

export default App;
