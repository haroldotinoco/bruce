import { retryDLQ } from '../dlq-retry.js';

const n = await retryDLQ();
// eslint-disable-next-line no-console -- CLI output
console.log(`Requeued ${n} job(s) from DLQ`);
process.exit(0);
