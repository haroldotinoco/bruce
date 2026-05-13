#!/usr/bin/env node
/**
 * Emite um JWT mínimo para desenvolvimento local quando `CLERK_SECRET_KEY` não está definido.
 * O pacote `@bruce/auth` usa jwt-decode nesse modo (sem verificação de assinatura).
 *
 * Claims: `sub` (utilizador) e `org_id` (tenant; deve coincidir com o que usas nas rotas).
 *
 * Uso:
 *   node scripts/print-dev-jwt.mjs
 *   export DEV_JWT_ORG_ID=org_meu_tenant node scripts/print-dev-jwt.mjs
 */
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const sub = process.env.DEV_JWT_SUB ?? 'dev_user';
const orgId = process.env.DEV_JWT_ORG_ID ?? 'org_local_dev';
const token = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub, org_id: orgId })}.x`;
console.log(token);
