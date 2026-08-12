export interface CreateInventorytDTO {
  productId: string;
  unitInput: string;
  stockExpected: number;
  stockCounted: number;
}

export const inventoryCsvConfig = {
  expectedHeaders: ["Codigo", "Unidade", "Digitado", "Estoque"],
  mapRow: (row: any): CreateInventorytDTO => ({
    productId: row["Codigo"],
    unitInput: row["Unidade"],
    stockCounted: Number(row["Digitado"]),
    stockExpected: Number(row["Estoque"]),
  }),
};
