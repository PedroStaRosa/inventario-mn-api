import { Router } from "express";
import { validateSchema } from "../../middlewares/validateSchema";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { authUserSchema, createUserSchema } from "./schemas/userSchema";
import { CreateUserController } from "./controllers/CreateUserController";
import { AuthUserController } from "./controllers/AuthUserController";
import { RefreshTokenController } from "./controllers/RefreshTokenController";
import { authLimiter } from "../../middlewares/rateLimiter";



const UserRoutes = Router();

/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     summary: Criar um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: Nome do usuário
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Senha do usuário (deve conter pelo menos uma letra maiúscula, uma minúscula e um número)
 *                 example: Senha123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
UserRoutes.post(
  "/api/v1/user",
  validateSchema(createUserSchema),
  new CreateUserController().handle
);

/**
 * @swagger
 * /api/v1/auth:
 *   post:
 *     summary: Autenticar usuário (login)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: Senha123
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
UserRoutes.post(
  "/api/v1/auth",
  authLimiter,
  validateSchema(authUserSchema),
  new AuthUserController().handle
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Novo token JWT
 *                 refreshToken:
 *                   type: string
 *                   description: Novo token de refresh
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
UserRoutes.post(
  "/api/v1/auth/refresh",
  isAuthenticated,
  authLimiter,
  new RefreshTokenController().handle
);

export default UserRoutes;