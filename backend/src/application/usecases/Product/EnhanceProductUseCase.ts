import type { IChatCompletionClient } from '../../../domain/ai/IChatCompletionClient';
import type { IProductRepository } from '../../../infrastructure/providers/interfaces/IProductRepository';
import type { NormalizedProduct } from '../../../domain/entities/NormalizedProduct/NormalizedProduct';

export type ProductInsightType = 'events' | 'audience' | 'emotion';

const PROMPTS: Record<ProductInsightType, string> = {
  events: `Reply with ONLY a single line: 5 short event names where this product works as a merchant/corporate gift, separated by commas. Nothing else: no title, no intro, no numbers, no bullets, no markdown, no explanations.
Example exact format: Trade show giveaway, Client appreciation day, New product launch, Year-end thank you, Employee award`,
  audience: `Reply with ONLY a single line: 5 short audience descriptions who are the best buyers or recipients for this product, separated by commas. Nothing else: no title, no intro, no numbers, no bullets, no markdown, no explanations.
Example exact format: corporate gift buyers, event planners, employee recognition teams, loyal customers, high-value clients`,
  emotion: `Reply with ONLY a single line: 5 short emotions or feelings this product evokes or is ideal for, separated by commas. Nothing else: no title, no intro, no numbers, no bullets, no markdown, no explanations.
Example exact format: gratitude, excitement, appreciation, celebration, trust`,
};

const NUMBERED_ITEM = /\d+[.)]\s*/g;
const DASH_BEFORE_EXPLANATION = /\s+[‐‑‒–—―\-]\s+/;
const SKIP_TITLE = /^(#|\*\*?)?\s*\d*\s*(events\s+where|works\s+as|merchant\s+gift|audience\s+for|best\s+buyers|emotions?\s+or|feelings?\s+this)/i;

function normalizeAiResponse(raw: string): string {
  const items: string[] = [];

  const segments = raw
    .split(NUMBERED_ITEM)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const segment of segments) {
    if (SKIP_TITLE.test(segment)) continue;

    let text = segment.replace(/\*\*/g, '').trim();
    const beforeDash = text.split(DASH_BEFORE_EXPLANATION)[0];
    if (beforeDash) text = beforeDash.trim();

    if (text.length > 1 && text.length < 120) {
      items.push(text);
    }
  }

  const normalized = items.slice(0, 5).join(', ').trim();
  return normalized || raw.replace(/\*\*/g, '').trim();
}

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
  events?: string;
  audience?: string;
  emotion?: string;
}

export class EnhanceProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly chatClient: IChatCompletionClient,
    private readonly insightType: ProductInsightType = 'events',
  ) { }

  async execute(input: EnhanceProductInput): Promise<EnhanceProductResult> {
    const { providerId, productId } = input;

    const product = await this.productRepository.findNormalized(providerId, productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const summary = productSummary(product);
    const userContent = `${summary}\n\n${PROMPTS[this.insightType]}`;

    const rawResponse = await this.chatClient.chat([
      { role: 'system', content: 'You reply only with the requested format. No titles, no numbering, no markdown, no extra text.' },
      { role: 'user', content: userContent },
    ]);
    const insight = normalizeAiResponse(rawResponse);

    const enrichedProduct = {
      ...product,
      [this.insightType]: insight,
    } as NormalizedProduct;

    return {
      product: enrichedProduct,
      [this.insightType]: insight,
    } as EnhanceProductResult;
  }
}
