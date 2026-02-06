export interface CreateInventorytDTO {
    productId: string;
    unitInput: string;
    stockExpected: number;
    stockCounted: number
}

export const inventoryCsvConfig = {
    expectedHeaders: ["CÃ³digo do Produto", "Unidade", "Digitado", "Estoque",],
    mapRow: (row: any): CreateInventorytDTO => ({
        productId: row["CÃ³digo do Produto"],
        unitInput: row["Unidade"],
        stockCounted: Number(row["Digitado"]),
        stockExpected: Number(row["Estoque"]),

    }),
};