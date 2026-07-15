import { createTheme } from "@mui/material/styles";

export const brand = {
  main: "#3CC179",
  mainDark: "#2AA063",
  sidebar: "#111827",
  sidebarDark: "#0B1120",
  contentBg: "#F5F7FA",
  boys: "#2a78d6",
  girls: "#e87ba4",
  boysTint: "#EAF3FE",
  boysTintBorder: "#CFE3FA",
  girlsTint: "#FDEEF4",
  girlsTintBorder: "#F8D6E4",
  good: "#0ca30c",
  warning: "#c98500",
  critical: "#d03b3b",
  muted: "#898781",
  chartTop: "#1976d2",
  cardShadow: "0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(16,24,40,0.05)",
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
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `system-ui, -apple-system, "Segoe UI", sans-serif`,
  },
  components: {
    MuiPaper: {
      variants: [
        {
          props: { variant: "outlined" },
          style: {
            borderColor: "#EAECF0",
            boxShadow: brand.cardShadow,
          },
        },
      ],
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "0 1px 2px rgba(16,24,40,0.06)" },
      },
    },
  },
});

export default theme;
