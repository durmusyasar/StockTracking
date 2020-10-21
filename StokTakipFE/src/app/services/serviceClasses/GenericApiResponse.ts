import { ApiResponse } from './ApiResponse';

export interface GenericApiResponse<T> extends ApiResponse {
    data: T;
}
