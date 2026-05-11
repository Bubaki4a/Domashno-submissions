import cron from 'node-cron';
import { runImportJob } from '../../jobs/importJob';
import { runEnrichJob } from '../../jobs/enrichJob';

const CRON_ENABLED = process.env.CRON_ENABLED === 'true' || process.env.CRON_ENABLED === '1';
const CRON_IMPORT_SCHEDULE = process.env.CRON_IMPORT_SCHEDULE || '0 */6 * * *'; // every 6 hours
const CRON_ENRICH_SCHEDULE = process.env.CRON_ENRICH_SCHEDULE || '*/15 * * * *'; // every 15 minutes

export function startScheduler(): void {
  if (!CRON_ENABLED) {
    console.log('⏸️ Cron scheduler disabled (set CRON_ENABLED=true to enable).');
    return;
  }

  cron.schedule(CRON_IMPORT_SCHEDULE, () => {
    runImportJob()
      .then((outcome) => {
        console.log(`[cron] import job finished: runId=${outcome.runId} status=${outcome.status} processed=${outcome.processedCount}`);
      })
      .catch((err) => {
        console.error('[cron] import job failed:', err instanceof Error ? err.message : err);
      });
  });
  console.log(`⏰ Cron: import job scheduled (${CRON_IMPORT_SCHEDULE})`);

  cron.schedule(CRON_ENRICH_SCHEDULE, () => {
    runEnrichJob()
      .then((outcome) => {
        console.log(`[cron] enrich job finished: runId=${outcome.runId} status=${outcome.status} processed=${outcome.processedCount}`);
      })
      .catch((err) => {
        console.error('[cron] enrich job failed:', err instanceof Error ? err.message : err);
      });
  });
  console.log(`⏰ Cron: enrich job scheduled (${CRON_ENRICH_SCHEDULE})`);
}
