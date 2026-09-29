export const ROLES = {
  ADMIN: "ADMIN",
  BASE_COMMANDER: "BASE_COMMANDER",
  LOGISTICS_OFFICER: "LOGISTICS_OFFICER",
};

export const PERMISSIONS = {
  dashboard: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  inventory: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  purchases: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  transfers: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  assignments: [ROLES.ADMIN, ROLES.BASE_COMMANDER],
  expenditures: [ROLES.ADMIN, ROLES.BASE_COMMANDER],
  audit: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
};

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

export function scopedBaseId(user, requestedBaseId) {
  if (isAdmin(user)) {
    return requestedBaseId || null;
  }
  return user.baseId;
}

export function assertBaseAccess(user, baseId) {
  if (isAdmin(user)) return;
  if (!user.baseId || user.baseId !== baseId) {
    const error = new Error("You do not have access to this base");
    error.statusCode = 403;
    throw error;
  }
}
