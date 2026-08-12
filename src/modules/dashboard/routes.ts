import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { validateSchema } from "../../middlewares/validateSchema";
import { GetDashboardController } from "./controllers/GetDashboardController";
import { getDashboardSchema } from "./schemas/dashboardSchema";

const DashboardRoutes = Router();

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Resumo agregado do sistema (dashboard)
 *     description: Retorna totais, contagens do período e listas recentes sem exigir que o frontend baixe todos os produtos/inventários.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 30
 *         description: Janela em dias para métricas do período
 *       - in: query
 *         name: recentInventoriesLimit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Quantidade de inventários recentes
 *       - in: query
 *         name: recentProductsLimit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Quantidade de produtos inventariados recentemente
 *     responses:
 *       200:
 *         description: Resumo do dashboard retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     days:
 *                       type: integer
 *                     from:
 *                       type: string
 *                       format: date-time
 *                     to:
 *                       type: string
 *                       format: date-time
 *                 totals:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: integer
 *                     inventories:
 *                       type: integer
 *                     inventoriesLastDays:
 *                       type: integer
 *                     productsNeverInventoried:
 *                       type: integer
 *                     productsInventoriedLastDays:
 *                       type: integer
 *                 recentInventories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       itemsCount:
 *                         type: integer
 *                 recentlyInventoriedProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       code:
 *                         type: string
 *                       description:
 *                         type: string
 *                       unit:
 *                         type: string
 *                         nullable: true
 *                       lastInventory:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
DashboardRoutes.get(
  "/api/v1/dashboard",
  isAuthenticated,
  /* validateSchema(getDashboardSchema), */
  new GetDashboardController().handle,
);

export default DashboardRoutes;
