import https from 'node:https';
import { Writable } from 'node:stream';

const BETTERSTACK_HOST = 'in.logs.betterstack.com';

/**
 * Pino destination stream: receives one JSON log line per write, ships batches to Better Stack.
 * No-op chunks if BETTERSTACK_SOURCE_TOKEN is unset (stream should not be used in that case).
 */
export function createBetterStackWritable(): Writable {
  const token = process.env.BETTERSTACK_SOURCE_TOKEN;
  const batch: string[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | undefined;

  function postBatch(lines: string[]): void {
    if (!token || lines.length === 0) return;

    const body = JSON.stringify(
      lines.map((line) => {
        try {
          const obj = JSON.parse(line) as Record<string, unknown>;
          const levelNum = typeof obj.level === 'number' ? obj.level : 30;
          const severity =
            levelNum >= 50 ? 'error' : levelNum >= 40 ? 'warn' : levelNum >= 30 ? 'info' : 'debug';
          return {
            dt:
              typeof obj.time === 'number'
                ? new Date(obj.time).toISOString()
                : new Date().toISOString(),
            message: typeof obj.msg === 'string' ? obj.msg : JSON.stringify(obj.msg ?? ''),
            severity,
            context: {
              correlation_id: obj.correlation_id,
              account_id: obj.account_id,
              venture_id: obj.venture_id,
              module: obj.module,
              agent_id: obj.agent_id,
              workflow_id: obj.workflow_id,
              ...obj,
            },
          };
        } catch {
          return {
            dt: new Date().toISOString(),
            message: line.slice(0, 4000),
            severity: 'info',
          };
        }
      }),
    );

    const req = https.request(
      {
        hostname: BETTERSTACK_HOST,
        path: '/',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        res.resume();
      },
    );
    req.on('error', () => {
      /* avoid crashing on network errors */
    });
    req.write(body);
    req.end();
  }

  function scheduleFlush(): void {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = undefined;
      if (batch.length === 0) return;
      const chunk = batch.splice(0, batch.length);
      postBatch(chunk);
    }, 250);
  }

  return new Writable({
    write(chunk, _enc, callback) {
      if (!token) {
        callback();
        return;
      }
      const line = chunk.toString().trim();
      if (line.length === 0) {
        callback();
        return;
      }
      batch.push(line);
      if (batch.length >= 25) {
        const lines = batch.splice(0, batch.length);
        postBatch(lines);
      } else {
        scheduleFlush();
      }
      callback();
    },
    final(callback) {
      if (batch.length > 0) {
        postBatch(batch.splice(0, batch.length));
      }
      callback();
    },
  });
}
