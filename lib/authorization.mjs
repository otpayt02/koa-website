export const ADMIN_STUDIO_ROLES = Object.freeze(/** @type {const} */ (["admin"]));

/**
 * Keep authoring-studio access narrower than the ranked moderation roles.
 * @param {unknown} role
 */
export function canAccessAdminStudio(role) {
  return ADMIN_STUDIO_ROLES.includes(role);
}
