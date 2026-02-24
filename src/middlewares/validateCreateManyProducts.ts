import { Request, Response, NextFunction } from "express";


export const validateCreateManyProducts = (req: Request, res: Response, next: NextFunction) => {
    const { products } = req.body;

    if (!products) {
        return res.status(400).json({ error: "Nenhum produto enviado." });
    }

    req.body.products = products;
    return next();
}