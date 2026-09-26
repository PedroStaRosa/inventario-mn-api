import { Router } from "express";
import { ListProductsController } from "./controllers/ListProductsController";

import { isAuthenticated } from "../../middlewares/isAuthenticated";

import { CreateProductController } from "./controllers/CreateProductController";
import { validateSchema } from "../../middlewares/validateSchema";
import {
  createManyProductsSchema,
  createProductSchema,
} from "./schemas/productSchema";

import { CreateManyProductsController } from "./controllers/CreateManyProductsController";
import { validateCreateManyProducts } from "../../middlewares/validateCreateManyProducts";
import UpdateABCSalesController from "./controllers/SetABCSalesController";
import { readLimiter, writeLimiter } from "../../middlewares/rateLimiter";

const ProductsRoutes = Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Listar todos os produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total_products:
 *                   type: number
 *                   description: Total de produtos
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
ProductsRoutes.get(
  "/api/v1/products",
  readLimiter,
  isAuthenticated,
  new ListProductsController().handle,
);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Criar um novo produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - description
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código único do produto
 *                 example: PROD001
 *               description:
 *                 type: string
 *                 description: Descrição do produto
 *                 example: Produto exemplo
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Código do produto já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
ProductsRoutes.post(
  "/api/v1/products",
  writeLimiter,
  isAuthenticated,
  validateSchema(createProductSchema),
  new CreateProductController().handle,
);

ProductsRoutes.post(
  "/api/v1/products/import/many",
  writeLimiter,
  isAuthenticated,
  validateSchema(createManyProductsSchema),
  validateCreateManyProducts,
  new CreateManyProductsController().handle,
);

ProductsRoutes.put(
  "/api/v1/products/updateABCSales",
  writeLimiter,
  isAuthenticated,
  new UpdateABCSalesController().handle,
);

export default ProductsRoutes;
