import { createTheme } from "@mui/material/styles";

export const brand = {
  main: "#3CC179",
  mainDark: "#2AA063",
  sidebar: "#111827",
  contentBg: "#F9FAFB",
  boys: "#2a78d6",
  girls: "#e87ba4",
  good: "#0ca30c",
  warning: "#c98500",
  critical: "#d03b3b",
  muted: "#898781",
  chartTop: "#1976d2",
};

export const SHIFT_COLORS = {
  Morning: "#2a78d6",
  Afternoon: "#1baf7a",
  Evening: "#eda100",
  Pending: brand.critical,
};

const theme = createTheme({
  palette: {
    primary: { main: brand.main },
    background: { default: brand.contentBg },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: `system-ui, -apple-system, "Segoe UI", sans-serif`,
  },
});

export default theme;
