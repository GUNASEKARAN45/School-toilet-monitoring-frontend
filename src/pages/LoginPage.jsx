import { useState } from "react";
import { Box, Card, Typography, TextField, Button, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LOGIN_CREDENTIALS, LOGIN_PASSWORD } from "../data/dummyData";
import { brand } from "../theme";

export default function LoginPage() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = LOGIN_CREDENTIALS[email.trim().toLowerCase()];
    if (!userId || password !== LOGIN_PASSWORD) {
      setError("Invalid email or password.");
      return;
    }
    setError("");
    loginAs(userId);
    navigate("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: brand.contentBg, p: 2 }}>
      <Card sx={{ maxWidth: 400, width: "100%", p: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", background: brand.main, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏫</Box>
          <Typography variant="h6" fontWeight={700}>School Toilet Monitoring</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email" type="email" fullWidth autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password" type="password" fullWidth
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit" variant="contained" disableElevation fullWidth size="large"
              sx={{ bgcolor: brand.main, "&:hover": { bgcolor: brand.mainDark } }}
            >
              Log in
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
