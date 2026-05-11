/**
 * DeepInfra implementation of IChatCompletionClient.
 * Uses OpenAI-compatible Chat Completions API.
 * @see https://deepinfra.com/nvidia/Nemotron-3-Nano-30B-A3B/api
 */

import type { IChatCompletionClient, ChatMessage } from '../../domain/ai/IChatCompletionClient';

const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';

interface DeepInfraChatResponse {
  choices?: Array<{
    message?: { role: string; content?: string };
    finish_reason?: string;
  }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

export interface DeepInfraClientConfig {
  apiKey: string;
  model?: string;
}

export class DeepInfraClient implements IChatCompletionClient {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: DeepInfraClientConfig) {
    const { apiKey, model = 'nvidia/Nemotron-3-Nano-30B-A3B' } = config;
    if (!apiKey?.trim()) {
      throw new Error('DeepInfraClient requires a non-empty apiKey.');
    }
    this.apiKey = apiKey.trim();
    this.model = model.trim() || 'nvidia/Nemotron-3-Nano-30B-A3B';
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(DEEPINFRA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    });

    if (!response.ok) {
      let detail = '';
      try {
        const body = await response.json().catch(() => ({}));
        detail = (body as { error?: { message?: string }; detail?: string }).error?.message
          ?? (body as { detail?: string }).detail
          ?? JSON.stringify(body);
      } catch {
        detail = await response.text();
      }
      throw new Error(`DeepInfra API error (${response.status}): ${detail || response.statusText}`);
    }

    const data = (await response.json()) as DeepInfraChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (content == null) {
      throw new Error('DeepInfra API returned no content in response');
    }
    return typeof content === 'string' ? content.trim() : String(content).trim();
  }
}
