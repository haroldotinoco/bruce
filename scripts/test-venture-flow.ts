/**
 * Fluxo local: venture + start-analysis (bruce-core) + scan por venture (opportunity).
 * Espera `pnpm dev` (ou equivalente) noutro terminal. Ver LOCAL_TEST.md.
 *
 * Uso: pnpm run test:venture-flow
 *      pnpm exec tsx scripts/test-venture-flow.ts --skip-opportunity
 *      pnpm exec tsx scripts/test-venture-flow.ts --no-log
 *      pnpm exec tsx scripts/test-venture-flow.ts --log-file=/tmp/run.log
 *
 * Por defeito grava cópia da saída em `logs/venture-flow-<timestamp>.log` (gitignored via *.log).
 * Cola esse ficheiro ou o conteúdo no chat para análise de erros do fluxo.
 *
 * Env: BASE_URL, OPPORTUNITY_URL, VENTURE_FLOW_LOG (override do caminho do log)
 */
import { execSync } from 'node:child_process';
import { mkdirSync, createWriteStream, type WriteStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const OPPORTUNITY_URL = (process.env.OPPORTUNITY_URL ?? 'http://localhost:3002').replace(/\/$/, '');

function parseArgs(argv: string[]) {
  let skipOpportunity = false;
  let noLog = false;
  let logFile: string | undefined;
  for (const a of argv) {
    if (a === '--skip-opportunity') skipOpportunity = true;
    if (a === '--no-log') noLog = true;
    if (a.startsWith('--log-file=')) logFile = a.slice('--log-file='.length);
  }
  return { skipOpportunity, noLog, logFile };
}

const { skipOpportunity: SKIP_OPPORTUNITY, noLog: NO_LOG, logFile: LOG_FILE_ARG } = parseArgs(
  process.argv.slice(2)
);

function safeTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function createRunLogger(): {
  log: (line: string) => void;
  logErr: (line: string) => void;
  finish: () => void;
  logPath: string | null;
} {
  if (NO_LOG) {
    return {
      log: (line: string) => process.stdout.write(line + (line.endsWith('\n') ? '' : '\n')),
      logErr: (line: string) => process.stderr.write(line + (line.endsWith('\n') ? '' : '\n')),
      finish: () => {},
      logPath: null,
    };
  }

  const path =
    LOG_FILE_ARG ||
    process.env.VENTURE_FLOW_LOG?.trim() ||
    join(ROOT, 'logs', `venture-flow-${safeTimestamp()}.log`);

  mkdirSync(dirname(path), { recursive: true });
  const stream: WriteStream = createWriteStream(path, { flags: 'w' });

  const writeBoth = (out: typeof process.stdout, line: string) => {
    const s = line.endsWith('\n') ? line : `${line}\n`;
    out.write(s);
    stream.write(s);
  };

  return {
    log: (line: string) => writeBoth(process.stdout, line),
    logErr: (line: string) => writeBoth(process.stderr, line),
    finish: () => {
      stream.end();
    },
    logPath: path,
  };
}

const { log, logErr, finish, logPath } = createRunLogger();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitHealth(baseUrl: string, label: string): Promise<void> {
  log(`==> A aguardar ${baseUrl}/health (${label}) ...`);
  for (let i = 0; i < 90; i++) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) {
        log('    OK.');
        return;
      }
    } catch {
      /* retry */
    }
    await sleep(2000);
  }
  logErr(`Timeout: ${baseUrl}/health não respondeu em ~3 minutos (tens o serviço a correr?).`);
  finish();
  process.exit(1);
}

function printJson(data: unknown): void {
  log(JSON.stringify(data, null, 2));
}

async function main(): Promise<void> {
  log(`[venture-flow] BASE_URL=${BASE_URL} OPPORTUNITY_URL=${OPPORTUNITY_URL}`);
  if (SKIP_OPPORTUNITY) log('[venture-flow] --skip-opportunity: só core, sem POST /scans');
  if (logPath) log(`[venture-flow] log também em: ${logPath}`);

  await waitHealth(BASE_URL, 'bruce-core');
  if (!SKIP_OPPORTUNITY) {
    await waitHealth(OPPORTUNITY_URL, 'opportunity');
  }

  log('==> JWT de desenvolvimento');
  const token = execSync('node scripts/print-dev-jwt.mjs', {
    encoding: 'utf-8',
    cwd: ROOT,
  }).trim();

  const auth = { Authorization: `Bearer ${token}` } as const;

  log('==> POST /ventures (Demo Magia)');
  const ventureRes = await fetch(`${BASE_URL}/ventures`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Demo Magia', stage: 'concept' }),
  });
  const ventureJson: unknown = await ventureRes.json().catch(() => null);
  if (!ventureRes.ok) {
    logErr(`Falha ao criar venture: ${ventureRes.status}`);
    printJson(ventureJson);
    finish();
    process.exit(1);
  }
  const ventureId =
    ventureJson && typeof ventureJson === 'object' && 'id' in ventureJson
      ? String((ventureJson as { id: unknown }).id)
      : '';
  if (!ventureId || ventureId === 'null') {
    logErr('Resposta inválida ao criar venture (id vazio).');
    printJson(ventureJson);
    finish();
    process.exit(1);
  }
  log(`    VENTURE_ID=${ventureId}`);

  log(`==> POST /ventures/${ventureId}/start-analysis`);
  const analysisRes = await fetch(`${BASE_URL}/ventures/${ventureId}/start-analysis`, {
    method: 'POST',
    headers: auth,
  });
  const analysisText = await analysisRes.text();
  try {
    printJson(JSON.parse(analysisText) as unknown);
  } catch {
    log(analysisText);
  }

  if (!SKIP_OPPORTUNITY) {
    log(`==> POST ${OPPORTUNITY_URL}/scans (venture_id + opportunities vazio)`);
    const scanRes = await fetch(`${OPPORTUNITY_URL}/scans`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ venture_id: ventureId, opportunities: [] }),
    });
    const scanText = await scanRes.text();
    try {
      printJson(JSON.parse(scanText) as unknown);
    } catch {
      log(scanText);
    }
  }

  log('');
  log('Fluxo concluído.');
  if (!SKIP_OPPORTUNITY) {
    log(
      'Lembrete: workflows Temporal precisam de workers (ex.: `pnpm workers` ou workers no dev). Ver LOCAL_TEST.md secção 2.'
    );
  }
  if (logPath) {
    log('');
    log('---');
    log(`Log desta run (cola no chat para análise): ${logPath}`);
  }
}

main()
  .catch((err) => {
    logErr(String(err));
    if (err instanceof Error && err.stack) logErr(err.stack);
    process.exitCode = 1;
  })
  .finally(() => {
    finish();
  });
