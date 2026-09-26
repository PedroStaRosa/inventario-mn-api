import rateLimit from "express-rate-limit";

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: "Muitas tentativas. Tente novamente em 5 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // máximo 5 tentativas por IP
  message: "Muitas tentativas de login. Tente novamente em 5 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshTokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // máximo 5 tentativas por IP
  message: "Muitas tentativas de refresh token. Tente novamente em 5 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // máximo 5 tentativas por IP
  message: "Muitas tentativas. Tente novamente em 5 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100, // máximo 100 requisições por IP
  message: "Muitas requisições. Tente novamente em 5 minutos.",
});

export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // máximo 50 requisições por IP
  message: "Muitas requisições de escrita. Tente novamente em 1 minuto.",
});

export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // máximo 200 requisições por IP
  message: "Muitas requisições de leitura. Tente novamente em 1 minuto.",
});
