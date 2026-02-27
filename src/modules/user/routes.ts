import { Router } from "express";
import { validateSchema } from "../../middlewares/validateSchema";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { authUserSchema, createUserSchema } from "./schemas/userSchema";
import { CreateUserController } from "./controllers/CreateUserController";
import { AuthUserController } from "./controllers/AuthUserController";
import { RefreshTokenController } from "./controllers/RefreshTokenController";
import { authLimiter } from "../../middlewares/rateLimiter";
import { GetUserByTokenController } from "./controllers/getUserByTokenController";



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

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     description: Retorna os dados do usuário atual com base no token JWT. Requer autenticação via Bearer token. A senha não é retornada.
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: "uuid"
 *               name: "João Silva"
 *               email: "joao@example.com"
 *               createdAt: "2026-01-15T10:00:00.000Z"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas requisições (rate limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
UserRoutes.get(
  "/api/v1/auth/me",
  isAuthenticated,
  authLimiter,
  new GetUserByTokenController().handle
);

export default UserRoutes;