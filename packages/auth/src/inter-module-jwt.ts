import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

function getSecretKey(): Uint8Array {
  const s = process.env.INTER_MODULE_JWT_SECRET ?? '';
  if (!s) {
    throw new Error('INTER_MODULE_JWT_SECRET is not set');
  }
  return encoder.encode(s);
}

export interface InterModuleJWTPayload {
  iss: string;
  sub: string;
  aud: string;
  module: string;
  iat: number;
  exp: number;
}

export async function signInterModuleJWT(
  accountId: string,
  ventureId: string,
  targetModule: string,
  callingModule: string,
  expiresInSeconds = 300
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({
    sub: `${accountId}--${ventureId}`,
    module: callingModule,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('bruce-internal')
    .setAudience(targetModule)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(getSecretKey());
}

export async function verifyInterModuleJWT(token: string): Promise<InterModuleJWTPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(), {
    algorithms: ['HS256'],
    issuer: 'bruce-internal',
    clockTolerance: '30s',
  });

  const aud = typeof payload.aud === 'string' ? payload.aud : String(payload.aud ?? '');
  const mod = payload.module;
  if (typeof mod !== 'string') {
    throw new Error('Invalid inter-module JWT: missing module');
  }

  const now = Math.floor(Date.now() / 1000);
  const iat = typeof payload.iat === 'number' ? payload.iat : now;
  const exp = typeof payload.exp === 'number' ? payload.exp : now + 300;
  return {
    iss: 'bruce-internal',
    sub: String(payload.sub ?? ''),
    aud,
    module: mod,
    iat,
    exp,
  };
}
