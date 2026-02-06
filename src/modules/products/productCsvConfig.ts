export interface CreateProductDTO {
    code: string;
    description: string;
}

/* export const HEADERS_CREATE_PRODUCTS = ["CÃ³digo do Produto", "DescriÃ§Ã£o do Produto"]; */

export const productCsvConfig = {
    expectedHeaders: [
        "CÃ³digo do Produto",
        "DescriÃ§Ã£o do Produto",
    ],
    mapRow: (row: any): CreateProductDTO => ({
        code: row["CÃ³digo do Produto"],
        description: row["DescriÃ§Ã£o do Produto"],
    }),
};