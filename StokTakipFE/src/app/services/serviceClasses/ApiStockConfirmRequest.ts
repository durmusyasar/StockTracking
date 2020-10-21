export interface ApiStockConfirmRequest {
    stockId: string;
    confirmStatus: boolean;
    note?: string;
}
