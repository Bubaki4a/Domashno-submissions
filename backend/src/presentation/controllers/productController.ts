import { Request, Response, Router } from 'express';
import { createProductRepository } from '../../infrastructure/repositories/repositoryFactory';
import { createChatCompletionClient } from '../../infrastructure/ai/aiClientFactory';
import { EnhanceProductUseCase } from '../../application/usecases/Product/EnhanceProductUseCase';

const router = Router();
const productRepository = createProductRepository();
const chatClient = createChatCompletionClient();
const enhanceProductUseCase = new EnhanceProductUseCase(productRepository, chatClient);

function matchesFilter(value: string | undefined, filter: string | undefined): boolean {
  if (!filter || filter.trim() === '') return true;
  if (!value) return false;
  return value.toLowerCase().includes(filter.trim().toLowerCase());
}

/** Display name/category from normalized table (normalized* preferred). */
function displayName(n: { name?: string; normalizedName?: string }): string {
  return (n.normalizedName ?? n.name ?? '').trim() || (n.name ?? '');
}
function displayCategory(n: { category?: string; normalizedCategory?: string }): string | undefined {
  return (n.normalizedCategory ?? n.category)?.trim() || n.category;
}

/**
 * GET /products
 * Lists from product_normalized. Query: category, name, catalogNumber (sku), providerId
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || '';
    const name = (req.query.name as string) || '';
    const catalogNumber = (req.query.catalogNumber as string) || '';
    const providerId = (req.query.providerId as string) || undefined;

    let list = await productRepository.findAllNormalized(providerId);

    if (category.trim()) {
      list = list.filter((p) => matchesFilter(displayCategory(p), category));
    }
    if (name.trim()) {
      list = list.filter((p) => matchesFilter(displayName(p), name));
    }
    if (catalogNumber.trim()) {
      list = list.filter((p) => matchesFilter(p.sku, catalogNumber));
    }

    const products = list.map((p) => ({
      id: p.id,
      providerId: p.providerId,
      name: displayName(p),
      category: displayCategory(p),
      sku: p.sku,
      price: p.price,
      description: p.description,
      imageUrl: p.imageUrl,
      stock: p.stock,
      provider: p.provider,
      normalizedName: p.normalizedName,
      normalizedDescription: p.normalizedDescription,
      normalizedCategory: p.normalizedCategory,
      events: p.events,
    }));
    res.json({ products });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({
      error: 'Failed to list products',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /products/:providerId/:id
 * Single product from product_normalized (for editing).
 */
router.get('/products/:providerId/:id', async (req: Request, res: Response) => {
  try {
    const providerId = (req.params.providerId ?? '').trim();
    const id = (req.params.id ?? '').trim();
    const product = await productRepository.findNormalized(providerId, id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ ...product, providerId });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      error: 'Failed to get product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /products/:providerId/:id
 * Updates product_normalized. Body: name, price, description, imageUrl, category, sku, stock, normalizedName, normalizedDescription, normalizedCategory
 */
router.put('/products/:providerId/:id', async (req: Request, res: Response) => {
  try {
    const providerId = (req.params.providerId ?? '').trim();
    const id = (req.params.id ?? '').trim();
    if (!providerId || !id) {
      return res.status(400).json({ error: 'providerId and id are required' });
    }

    const existing = await productRepository.findNormalized(providerId, id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const body = req.body as Record<string, unknown>;
    const merged = {
      name: body.name !== undefined ? body.name : existing.name,
      price: body.price !== undefined ? body.price : existing.price,
      description: body.description !== undefined ? body.description : existing.description,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
      category: body.category !== undefined ? body.category : existing.category,
      sku: body.sku !== undefined ? body.sku : existing.sku,
      stock: body.stock !== undefined ? body.stock : existing.stock,
      provider: body.provider !== undefined ? body.provider : existing.provider,
      normalizedName: body.normalizedName !== undefined ? body.normalizedName : existing.normalizedName,
      normalizedDescription: body.normalizedDescription !== undefined ? body.normalizedDescription : existing.normalizedDescription,
      normalizedCategory: body.normalizedCategory !== undefined ? body.normalizedCategory : existing.normalizedCategory,
      metadata: body.metadata !== undefined ? body.metadata : existing.metadata,
      events: body.events !== undefined ? body.events : existing.events,
    };

    await productRepository.saveNormalized(providerId, id, merged);
    const saved = await productRepository.findNormalized(providerId, id);
    res.json({ ...saved, providerId });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /products/:providerId/:id/enhance
 * Calls AI to generate "5 events for merchant gift". Returns data only; does not save. User saves via PUT.
 */
router.post('/products/:providerId/:id/enhance', async (req: Request, res: Response) => {
  try {
    const providerId = (req.params.providerId ?? '').trim();
    const id = (req.params.id ?? '').trim();
    if (!providerId || !id) {
      return res.status(400).json({ error: 'providerId and id are required' });
    }

    const result = await enhanceProductUseCase.execute({ providerId, productId: id });
    res.json({
      ...result.product,
      providerId,
      events: result.events,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Product not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('DEEP_INFRA_KEY')) {
        return res.status(503).json({ error: error.message });
      }
    }
    console.error('Error enhancing product:', error);
    res.status(500).json({
      error: 'Failed to enhance product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as productRouter };
