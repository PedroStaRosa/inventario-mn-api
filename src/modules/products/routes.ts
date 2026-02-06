import { Router } from "express";
import { ListProductsController } from "./controllers/ListProductsController";

import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { CreateProductByFileController } from "./controllers/CreateProductByFileController";

import { CreateProductController } from "./controllers/CreateProductController";
import { validateSchema } from "../../middlewares/validateSchema";
import { createProductSchema } from "./schemas/productSchema";
import { uploadSingle } from "../../utils/multer";
import { validateCsvMiddleware } from "../../middlewares/validateCsvMiddleware";
import { productCsvConfig } from "./productCsvConfig";




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
  isAuthenticated,
  new ListProductsController().handle
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
  isAuthenticated,
  validateSchema(createProductSchema),
  new CreateProductController().handle
)

/**
 * @swagger
 * /api/v1/products/import:
 *   post:
 *     summary: Importar produtos via arquivo CSV
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo CSV com os produtos (colunas: code, description)
 *     responses:
 *       201:
 *         description: Produtos importados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imported:
 *                   type: number
 *       400:
 *         description: Arquivo inválido ou formato incorreto
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
 */
ProductsRoutes.post(
  "/api/v1/products/import",
  isAuthenticated,
  uploadSingle("file"),
  validateCsvMiddleware(productCsvConfig),
  new CreateProductByFileController().handle
);


export default ProductsRoutes;
