import { Pagination } from './Pagination';

export interface PaginationResponse extends Pagination {
    rowCount: number;
}
