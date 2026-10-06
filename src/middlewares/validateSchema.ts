import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";

type RequestSchema = ZodType<{
  body?: unknown;
  query?: unknown;
  params?: unknown;
}>;

export const validateSchema =
  (schema: RequestSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body;

      if (parsed.query !== undefined) {
        Object.assign(req.query, parsed.query);
      }

      if (parsed.params !== undefined) {
        Object.assign(req.params, parsed.params);
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const isMissingBody = error.issues.some(
          (issue) =>
            issue.message ===
            "Invalid input: expected object, received undefined",
        );
        if (isMissingBody) {
          return res.status(400).json({
            error: "Erro validação",
            details: [
              {
                message:
                  "Corpo da requisição é obrigatório. Envie um JSON com o campo(s) obrigatório(s). Verifique na documentação para mais informações.",
              },
            ],
          });
        }
        return res.status(400).json({
          error: "Erro validação",
          details: error.issues.map((issue) => ({ message: issue.message })),
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };
