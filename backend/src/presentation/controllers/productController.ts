import { Request, Response, Router } from 'express';
import { createProductRepository } from '../../infrastructure/repositories/repositoryFactory';
import { createChatCompletionClient } from '../../infrastructure/ai/aiClientFactory';
import { EnhanceProductUseCase } from '../../application/usecases/Product/EnhanceProductUseCase';
import { requireRole } from '../../infrastructure/web/authMiddleware';
import { DeleteNormalizedProductUseCase } from '../../application/usecases/Product/DeleteNormalizedProductUseCase';

const router = Router();
const productRepository = createProductRepository();
const chatClient = createChatCompletionClient();

// Инициализиране на Use Cases
const enhanceProductUseCase = new EnhanceProductUseCase(productRepository, chatClient);
const deleteNormalizedProductUseCase = new DeleteNormalizedProductUseCase(productRepository);

// Помощни функции за филтриране и показване
function matchesFilter(value: string | undefined, filter: string | undefined): boolean {
  if (!filter || filter.trim() === '') return true;
  if (!value) return false;
  return value.toLowerCase().includes(filter.trim().toLowerCase());
}

function displayName(n: { name?: string; normalizedName?: string }): string {
  return (n.normalizedName ?? n.name ?? '').trim() || (n.name ?? '');
}

function displayCategory(n: { category?: string; normalizedCategory?: string }): string | undefined {
  return (n.normalizedCategory ?? n.category)?.trim() || n.category;
}

/**
 * GET /api/products
 * Списък с продукти. Достъпен за всички оторизирани потребители.
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
 * GET /api/products/:providerId/:id
 * Детайли за един продукт. Достъпен за всички оторизирани потребители.
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
 * PUT /api/products/:providerId/:id
 * Обновяване на продукт. Само за Administrator и Manager.
 */
router.put(
  '/products/:providerId/:id', 
  requireRole(['administrator', 'manager']), 
  async (req: Request, res: Response) => {
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
 * DELETE /api/products/:providerId/:id
 * ИЗТРИВАНЕ на нормализиран продукт. САМО за Administrator.
 */
router.delete(
  '/products/:providerId/:id', 
  requireRole(['administrator']), 
  async (req: Request, res: Response) => {
    try {
      const providerId = (req.params.providerId ?? '').trim();
      const id = (req.params.id ?? '').trim();
      
      if (!providerId || !id) {
        return res.status(400).json({ error: 'providerId and id are required' });
      }

      await deleteNormalizedProductUseCase.execute(providerId, id);
      
      res.json({ 
        success: true, 
        message: 'Product normalization data deleted successfully' 
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      });
    }
});

/**
 * POST /api/products/:providerId/:id/enhance
 * AI подобрение. Само за Administrator и Manager.
 */
router.post(
  '/products/:providerId/:id/enhance', 
  requireRole(['administrator', 'manager']), 
  async (req: Request, res: Response) => {
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