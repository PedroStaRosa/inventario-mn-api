import { Request, Response, NextFunction } from "express";
import { parseCsv } from "../utils/csvParser";

interface csvConfig<T> {
    expectedHeaders: string[];
    mapRow: (row: any) => T;
}

export function validateCsvMiddleware<T>(
    csvConfig: csvConfig<T>,
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) {
            return res.status(400).json({
                error: "Arquivo CSV não enviado",
            });
        }

        if (!req.file.mimetype.includes("csv")) {
            return res.status(400).json({
                error: "Arquivo enviado não é um CSV válido",
            });
        }

        try {
            const filePath = req.file.path;

            const data = await parseCsv<T>(
                filePath, csvConfig
            );

            if (data.length === 0) {
                return res.status(400).json({
                    error: "CSV está vazio",
                });
            }

            req.body.csvData = data;

            next();
        } catch (error: any) {
            return res.status(400).json({
                error: error.message || "Erro ao validar CSV",
            });
        }
    };
}