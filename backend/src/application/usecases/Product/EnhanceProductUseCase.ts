import type { IChatCompletionClient } from '../../../domain/ai/IChatCompletionClient';
import type { IProductRepository } from '../../../infrastructure/providers/interfaces/IProductRepository';
import type { NormalizedProduct } from '../../../domain/entities/NormalizedProduct/NormalizedProduct';

const ENHANCE_PROMPT = `Reply with ONLY a single line: 5 short event names where this product works as a merchant/corporate gift, separated by commas. Nothing else: no title, no intro, no numbers, no bullets, no markdown, no explanations.
Example exact format: Trade show giveaway, Client appreciation day, New product launch, Year-end thank you, Employee award`;

/** Matches one numbered item: "1. " or "2) " etc. */
const NUMBERED_ITEM = /\d+[.)]\s*/g;
/** Any dash-like char (en/em dash, hyphen) with optional surrounding spaces – for splitting off explanations. */
const DASH_BEFORE_EXPLANATION = /\s+[‐‑‒–—―\-]\s+/;

/**
 * Normalizes AI response: strip title, numbering, markdown, explanations; extract event names; output comma-separated only.
 */
function normalizeEventsResponse(raw: string): string {
  const events: string[] = [];

  // Split by numbered list (works for multi-line or single-line "1. ... 2. ..." text)
  const segments = raw
    .split(NUMBERED_ITEM)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const skipTitle = /^(#|\*\*?)?\s*\d*\s*(events\s+where|works\s+as|merchant\s+gift)/i;

  for (const segment of segments) {
    if (skipTitle.test(segment)) continue;

    let text = segment.replace(/\*\*/g, '').trim();
    // Keep only the event name: part before " – explanation" or " - explanation"
    const beforeDash = text.split(DASH_BEFORE_EXPLANATION)[0];
    if (beforeDash) text = beforeDash.trim();

    if (text.length > 2 && text.length < 120) events.push(text);
  }

  return events.slice(0, 5).join(', ').trim() || raw.replace(/\*\*/g, '').trim();
}

/**
 * Builds a short product summary for the AI from normalized product data.
 */
function productSummary(product: NormalizedProduct): string {
  const name = product.normalizedName ?? product.name ?? 'Unknown product';
  const category = product.normalizedCategory ?? product.category ?? '';
  const desc = product.normalizedDescription ?? product.description ?? '';
  const parts = [`Product: ${name}`];
  if (category) parts.push(`Category: ${category}`);
  if (desc) parts.push(`Description: ${desc}`);
  return parts.join('\n');
}

export interface EnhanceProductInput {
  providerId: string;
  productId: string;
}

export interface EnhanceProductResult {
  product: NormalizedProduct;
  events: string;
}

/**
 * Loads a normalized product, asks the configured AI for 5 events (merchant gift use cases),
 * and returns the generated events. Does not save to DB; user saves via the product edit form.
 */
export class EnhanceProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly chatClient: IChatCompletionClient,
  ) { }

  async execute(input: EnhanceProductInput): Promise<EnhanceProductResult> {
    const { providerId, productId } = input;

    const product = await this.productRepository.findNormalized(providerId, productId);
    if (!product) {
      throw new Error('Product not found 1');
    }

    const summary = productSummary(product);
    const userContent = `${summary}\n\n${ENHANCE_PROMPT}`;

    const rawResponse = await this.chatClient.chat([
      { role: 'system', content: 'You reply only with the requested format. No titles, no numbering, no markdown, no extra text.' },
      { role: 'user', content: userContent },
    ]);
    const events = normalizeEventsResponse(rawResponse);

    // Return enhanced data without saving; frontend shows it and user saves via Save button
    return {
      product: { ...product, events },
      events,
    };
  }
}
