export const ROLES = {
  ADMIN: "ADMIN",
  BASE_COMMANDER: "BASE_COMMANDER",
  LOGISTICS_OFFICER: "LOGISTICS_OFFICER",
};

export const ROLE_LABELS = {
  ADMIN: "Admin",
  BASE_COMMANDER: "Base Commander",
  LOGISTICS_OFFICER: "Logistics Officer",
};

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", roles: Object.values(ROLES) },
  { to: "/purchases", label: "Purchases", roles: Object.values(ROLES) },
  { to: "/transfers", label: "Transfers", roles: Object.values(ROLES) },
  {
    to: "/assignments",
    label: "Assignments",
    roles: [ROLES.ADMIN, ROLES.BASE_COMMANDER],
  },
  {
    to: "/expenditures",
    label: "Expenditures",
    roles: [ROLES.ADMIN, ROLES.BASE_COMMANDER],
  },
  { to: "/audit-logs", label: "Audit logs", roles: Object.values(ROLES) },
];
