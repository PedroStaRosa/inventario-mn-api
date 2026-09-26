import { Response } from "express";
import { getLogger } from "./logger";

type ClientError = {
  status: number;
  message: string;
};

const EXACT_CLIENT_ERRORS: Record<string, ClientError> = {
  "Produto já se encontra cadastrado no banco.": {
    status: 409,
    message: "Produto já cadastrado.",
  },
  "Produto não encontrado.": {
    status: 404,
    message: "Produto não encontrado.",
  },
  "User not found": {
    status: 404,
    message: "Usuário não encontrado.",
  },
  "User already exists": {
    status: 409,
    message: "Usuário já cadastrado.",
  },
  "Credenciais Invalidas.": {
    status: 401,
    message: "Credenciais inválidas.",
  },
  "Refresh token inválido.": {
    status: 401,
    message: "Refresh token inválido.",
  },
  "Refresh token expirado.": {
    status: 401,
    message: "Refresh token expirado.",
  },
  "Usuário não encontrado ou removido.": {
    status: 401,
    message: "Usuário não encontrado ou removido.",
  },
};

function resolveClientError(error: Error): ClientError | null {
  const exact = EXACT_CLIENT_ERRORS[error.message];
  if (exact) {
    return exact;
  }

  if (
    error.message.startsWith("Código ") &&
    error.message.includes("não é um código válido")
  ) {
    return { status: 400, message: "Código do produto inválido." };
  }

  if (error.message.startsWith("Há códigos repetidos")) {
    return { status: 400, message: "Há códigos repetidos no envio." };
  }

  if (error.message.startsWith("Inventory_")) {
    if (error.message.includes("Nome de inventário já se encontra cadastrado")) {
      return {
        status: 400,
        message: "Nome de inventário já cadastrado.",
      };
    }
    if (error.message.includes("Produtos não encontrados:")) {
      return {
        status: 404,
        message: "Um ou mais produtos não foram encontrados.",
      };
    }
  }

  if (error.message.includes("sem permissão")) {
    return { status: 403, message: "Sem permissão para esta operação." };
  }

  if (
    error.message.includes("Inventario não encontrado") ||
    error.message.includes("Inventário não encontrado") ||
    error.message.includes("não encontrado")
  ) {
    return { status: 404, message: "Recurso não encontrado." };
  }

  if (
    error.message.includes("já existe") ||
    error.message.includes("already exists")
  ) {
    return { status: 409, message: "Recurso já existe." };
  }

  return null;
}

/**
 * Loga o erro no servidor e responde ao cliente com mensagem controlada.
 * Nunca devolve stack, SQL ou mensagem crua de libs ao cliente.
 */
export function respondWithMappedError(
  res: Response,
  error: unknown,
  context: string,
  extra?: Record<string, unknown>,
) {
  getLogger().error({ err: error }, context);

  if (error instanceof Error) {
    const mapped = resolveClientError(error);
    if (mapped) {
      return res.status(mapped.status).json({
        error: mapped.message,
        ...extra,
      });
    }
  }

  return res.status(500).json({
    error: "Erro interno do servidor",
    ...extra,
  });
}

export function mapErrorForClient(error: unknown): ClientError {
  if (error instanceof Error) {
    return (
      resolveClientError(error) ?? {
        status: 500,
        message: "Erro interno do servidor",
      }
    );
  }
  return { status: 500, message: "Erro interno do servidor" };
}
