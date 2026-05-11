/**
 * Structured JSON logging for pipeline jobs.
 * One JSON object per line for easy parsing (e.g. grep, log aggregators).
 */

export type JobLogLevel = 'info' | 'warn' | 'error';

export interface JobLogFields {
  level?: JobLogLevel;
  job_name?: string;
  run_id?: number;
  product_id?: string;
  provider_id?: string;
  model?: string;
  prompt_version?: string;
  message?: string;
  [key: string]: unknown;
}

const PROMPT_VERSION = process.env.AI_PROMPT_VERSION || 'v1';

export function getPromptVersion(): string {
  return PROMPT_VERSION;
}

export function logJob(fields: JobLogFields): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level: fields.level ?? 'info',
    ...fields,
  };
  const line = JSON.stringify(payload);
  if (payload.level === 'error') {
    console.error(line);
  } else if (payload.level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}
