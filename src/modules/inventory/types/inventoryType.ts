export interface InventoryType {
    name: string;
    userId: string;
    items: {
        productId: string;
        unitInput?: string;
        stockExpected: number;
        stockCounted: number;
    }[];
}