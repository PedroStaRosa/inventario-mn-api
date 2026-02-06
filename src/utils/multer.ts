import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

// Multer salva os arquivos em /uploads
export const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos CSV são permitidos'));
        }
    }
});

// Wrapper para capturar erros do multer e retornar resposta adequada
export const uploadSingle = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, (err: any) => {
            if (err) {
                if (err instanceof MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return res.status(400).json({
                            error: "Arquivo muito grande. Tamanho máximo permitido: 5MB",
                        });
                    }
                    return res.status(400).json({
                        error: err.message,
                    });
                }

                // Erros do fileFilter
                if (err.message && err.message.includes("Apenas arquivos CSV são permitidos")) {
                    return res.status(400).json({
                        error: err.message,
                    });
                }

                return next(err);
            }
            next();
        });
    };
};