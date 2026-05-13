import { verifyToken } from '@clerk/backend';
import { jwtDecode } from 'jwt-decode';
import { logger } from '@bruce/logger';

export interface ClerkSession {
  userId: string;
  orgId: string;
  orgSlug: string;
}

type ClerkJwtPayload = {
  sub?: string;
  org_id?: string;
  org_slug?: string;
  o?: { id?: string; slg?: string };
};

function payloadOrgId(payload: ClerkJwtPayload): string | undefined {
  if (payload.org_id) {
    return payload.org_id;
  }
  if (payload.o && typeof payload.o === 'object' && payload.o.id) {
    return payload.o.id;
  }
  return undefined;
}

/**
 * Verifies Clerk JWT when CLERK_SECRET_KEY is set (production).
 * Falls back to jwt-decode only for local development (no signature verification).
 *
 * With `loadRepoEnv()`, the root `.env` is always loaded — if `CLERK_SECRET_KEY` is set there,
 * real Clerk verification runs. Dev tokens from `scripts/print-dev-jwt.mjs` are not Clerk-signed;
 * use `AUTH_DEV_JWT_ONLY=true` or leave `CLERK_SECRET_KEY` empty to use the decode-only path.
 */
export async function verifyClerkToken(token: string): Promise<ClerkSession> {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  const devDecodeOnly = process.env.AUTH_DEV_JWT_ONLY === 'true';

  if (secretKey && !devDecodeOnly) {
    try {
      const payload = (await verifyToken(token, {
        secretKey,
      })) as unknown as ClerkJwtPayload;

      const orgId = payloadOrgId(payload);
      if (!payload.sub || !orgId) {
        throw new Error('Missing org_id or sub in verified token');
      }

      return {
        userId: payload.sub,
        orgId,
        orgSlug: payload.org_slug ?? payload.o?.slg ?? '',
      };
    } catch (error) {
      logger.error({ error }, 'Clerk verifyToken failed');
      throw new Error('Invalid or expired JWT');
    }
  }

  return verifyClerkJWT(token);
}

export function verifyClerkJWT(token: string): ClerkSession {
  try {
    const decoded = jwtDecode<ClerkJwtPayload>(token);
    const orgId = payloadOrgId(decoded);
    if (!decoded.sub || !orgId) {
      throw new Error('Missing claims');
    }

    return {
      userId: decoded.sub,
      orgId,
      orgSlug: decoded.org_slug ?? '',
    };
  } catch (error) {
    logger.error({ error }, 'Failed to verify Clerk JWT (decode fallback)');
    throw new Error('Invalid or expired JWT');
  }
}

export function extractTokenFromHeader(authHeader: string): string {
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid Authorization header format');
  }
  return parts[1]!;
}
