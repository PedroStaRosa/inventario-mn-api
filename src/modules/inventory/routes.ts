import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { validateSchema } from "../../middlewares/validateSchema";
import {
  createInventorySchema,
  idInventorySchema,
  idProductInventorySchema,
  suggestedInventorySchema,
} from "./schemas/inventorySchema";
import { DeleteInventoryController } from "./controllers/DeleteInventoryController";
import { ListAllInventoriesController } from "./controllers/ListAllInventoriesController";
import { CreateInventoryController } from "./controllers/CreateInventoryController";
import { ListInventaryByIdController } from "./controllers/ListInventoryByIdController";
import { SuggestedInventoryController } from "./controllers/SuggestedInventoryController";
import {
  apiLimiter,
  readLimiter,
  writeLimiter,
} from "../../middlewares/rateLimiter";
import { SearchProductInventoriesController } from "./controllers/SearchProductInventoriesController";

const InventoryRoutes = Router();

/**
 * @swagger
 * /api/v1/inventories:
 *   get:
 *     summary: Listar todos os inventários
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inventários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
InventoryRoutes.get(
  "/api/v1/inventories",
  readLimiter,
  isAuthenticated,
  new ListAllInventoriesController().handle,
);

/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Buscar inventário por ID
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do inventário
 *     responses:
 *       200:
 *         description: Inventário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Inventário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
InventoryRoutes.get(
  "/api/v1/inventory",
  readLimiter,
  isAuthenticated,
  validateSchema(idInventorySchema),
  new ListInventaryByIdController().handle,
);

/**
 * @swagger
 * /api/v1/inventory/suggested:
 *   get:
 *     summary: Obter sugestões de produtos para inventário
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de dias para buscar produtos não inventariados
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Limite de resultados
 *     responses:
 *       200:
 *         description: Lista de produtos sugeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
InventoryRoutes.get(
  "/api/v1/inventory/suggested",
  readLimiter,
  isAuthenticated,
  validateSchema(suggestedInventorySchema),
  new SuggestedInventoryController().handle,
);

/**
 * @swagger
 * /api/v1/inventory/product:
 *   get:
 *     summary: Buscar histórico de inventários de um produto
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Histórico de inventários do produto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   inventory:
 *                     $ref: '#/components/schemas/Inventory'
 *                   stockCounted:
 *                     type: number
 *                   stockExpected:
 *                     type: number
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
InventoryRoutes.get(
  "/api/v1/inventory/product",
  readLimiter,
  isAuthenticated,
  validateSchema(idProductInventorySchema),
  new SearchProductInventoriesController().handle,
);

/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     summary: Criar inventário manualmente
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventoryName
 *               - inventoryItens
 *             properties:
 *               inventoryName:
 *                 type: string
 *                 description: Nome do inventário
 *                 example: Inventário Mensal - Janeiro 2024
 *               inventoryItens:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - stockExpected
 *                     - stockCounted
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ID do produto
 *                     unitInput:
 *                       type: string
 *                       description: Unidade de medida (opcional)
 *                     stockExpected:
 *                       type: number
 *                       description: Estoque esperado
 *                     stockCounted:
 *                       type: number
 *                       description: Estoque contado
 *     responses:
 *       201:
 *         description: Inventário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
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
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
InventoryRoutes.post(
  "/api/v1/inventory",
  writeLimiter,
  isAuthenticated,
  apiLimiter,
  validateSchema(createInventorySchema),
  new CreateInventoryController().handle,
);

/**
 * @swagger
 * /api/v1/inventory:
 *   delete:
 *     summary: Deletar inventário
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do inventário a ser deletado
 *     responses:
 *       200:
 *         description: Inventário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inventário deletado com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Inventário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
InventoryRoutes.delete(
  "/api/v1/inventory",
  writeLimiter,
  isAuthenticated,
  validateSchema(idInventorySchema),
  new DeleteInventoryController().handle,
);

export default InventoryRoutes;
