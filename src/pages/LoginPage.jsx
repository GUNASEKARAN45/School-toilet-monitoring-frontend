import { Box, Card, Typography, List, ListItemButton, ListItemText, Chip, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { users, ROLE_LABELS, ROLES, getSchoolById } from "../data/dummyData";
import { brand } from "../theme";

const roleOrder = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR, ROLES.CLEANER];

export default function LoginPage() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (userId) => {
    loginAs(userId);
    navigate("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: brand.contentBg, p: 2 }}>
      <Card sx={{ maxWidth: 640, width: "100%", p: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", background: brand.main, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏫</Box>
          <Typography variant="h6" fontWeight={700}>School Toilet Monitoring — Demo Login</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Pick a demo account to preview what each role sees. No password needed — this is a dummy-data
          walkthrough of the proposed role-based architecture.
        </Typography>

        {roleOrder.map((role) => (
          <Box key={role} sx={{ mb: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
              {ROLE_LABELS[role]}
            </Typography>
            <List dense sx={{ bgcolor: "#F9FAFB", borderRadius: 2 }}>
              {users.filter((u) => u.role === role).slice(0, 3).map((u) => (
                <ListItemButton key={u.id} onClick={() => handleLogin(u.id)} sx={{ borderRadius: 2 }}>
                  <ListItemText
                    primary={u.name}
                    secondary={u.schoolId ? getSchoolById(u.schoolId)?.name : u.coversSchoolIds ? `Covers ${u.coversSchoolIds.length} schools` : "All schools"}
                  />
                  <Chip size="small" label="Log in" sx={{ bgcolor: brand.main + "22", color: brand.mainDark, fontWeight: 600 }} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary">
          The Overall Viewer sees every district with filters to drill into a specific district or
          school; School Admins and Supervisors are scoped to their own schools.
        </Typography>
      </Card>
    </Box>
  );
}
