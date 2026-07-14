import { ROLES } from "./data/dummyData";

export const MENU = [
  { text: "Dashboard", path: "/", icon: "Dashboard", roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR] },
  { text: "Schools", path: "/schools", icon: "School", roles: [ROLES.SUPER_ADMIN] },
  { text: "Toilet Blocks", path: "/toilet-blocks", icon: "Wc", roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR] },
  { text: "Cleaning Schedule", path: "/cleaning-schedule", icon: "CleaningServices", roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.SUPERVISOR, ROLES.CLEANER] },
  { text: "Staff", path: "/staff", icon: "Groups", roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN] },
];
