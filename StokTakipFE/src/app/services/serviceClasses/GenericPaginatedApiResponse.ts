import { GenericApiResponse } from './GenericApiResponse';
import { PaginationResponse } from './PaginationResponse';

export interface GenericPaginatedApiResponse<T> extends GenericApiResponse<T> {
    pagination: PaginationResponse;
}
