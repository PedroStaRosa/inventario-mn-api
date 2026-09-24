import rateLimit from "express-rate-limit";

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
