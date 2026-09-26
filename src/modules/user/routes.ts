import { Router } from "express";
import { validateSchema } from "../../middlewares/validateSchema";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import {
  authUserSchema,
  createUserSchema,
  logoutSchema,
  refreshTokenSchema,
} from "./schemas/userSchema";
import { CreateUserController } from "./controllers/CreateUserController";
import { AuthUserController } from "./controllers/AuthUserController";
import { RefreshTokenController } from "./controllers/RefreshTokenController";
import { LogoutController } from "./controllers/LogoutController";
import {
  authLimiter,
  loginLimiter,
  readLimiter,
  refreshTokenLimiter,
  registerLimiter,
} from "../../middlewares/rateLimiter";
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
 *                 maxLength: 32
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
  registerLimiter,
  validateSchema(createUserSchema),
  new CreateUserController().handle,
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
 *         description: Autenticação realizada com sucesso. Retorna access token (JWT) e refresh token opaco.
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
  loginLimiter,
  validateSchema(authUserSchema),
  new AuthUserController().handle,
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Renovar access token com refresh token opaco
 *     description: Não usa Bearer do access token. Envie o refreshToken no body. O refresh atual é revogado (rotação) e um novo par é emitido.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token opaco obtido no login ou no refresh anterior
 *     responses:
 *       200:
 *         description: Tokens renovados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Refresh token inválido, expirado ou reutilizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
UserRoutes.post(
  "/api/v1/auth/refresh",
  refreshTokenLimiter,
  validateSchema(refreshTokenSchema),
  new RefreshTokenController().handle,
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Encerrar sessão (revogar refresh token)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token a ser revogado
 *     responses:
 *       200:
 *         description: Sessão encerrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
UserRoutes.post(
  "/api/v1/auth/logout",
  authLimiter,
  validateSchema(logoutSchema),
  new LogoutController().handle,
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
  readLimiter,
  isAuthenticated,
  new GetUserByTokenController().handle,
);

export default UserRoutes;
