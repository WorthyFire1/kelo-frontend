const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

interface JwtPayload {
  role?: string | string[];
  roles?: string | string[];
  [ROLE_CLAIM]?: string | string[];
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function getJwtRoles(token: string): string[] {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return [];

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedBase64)) as JwtPayload;

    return [...new Set([
      ...toArray(payload.role),
      ...toArray(payload.roles),
      ...toArray(payload[ROLE_CLAIM]),
    ])];
  } catch {
    return [];
  }
}

