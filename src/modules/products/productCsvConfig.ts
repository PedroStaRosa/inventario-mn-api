export interface CreateProductDTO {
  code: string;
  description: string;
}

/* export const HEADERS_CREATE_PRODUCTS = ["CÃ³digo do Produto", "DescriÃ§Ã£o do Produto"]; */

export const productCsvConfig = {
  expectedHeaders: ["Codigo", "Descricao"],
  mapRow: (row: any): CreateProductDTO => ({
    code: row["Codigo"],
    description: row["Descricao"],
  }),
};
