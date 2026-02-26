/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSellsShiftManagementDto } from '../models/CreateSellsShiftManagementDto';
import type { CreateSellsShiftManagementSuccessDto } from '../models/CreateSellsShiftManagementSuccessDto';
import type { GetUserSellsShiftSuccessDto } from '../models/GetUserSellsShiftSuccessDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SellsShiftManagementService {
    /**
     * Create a new sells shift management entry for a user
     * Creates a new sells shift management entry for a user. This endpoint is protected and requires the user to have the SUPER ADMIN role.
     * @returns any
     * @throws ApiError
     */
    public static sellsShiftManagementControllerCreate({
        userId,
        authorization,
        requestBody,
    }: {
        /**
         * The ID of the user for whom the sells shift management entry is being created
         */
        userId: string,
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: CreateSellsShiftManagementDto,
    }): CancelablePromise<CreateSellsShiftManagementSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sells-shift-management/{userId}',
            path: {
                'userId': userId,
            },
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get sells shift management records for a specific user
     * Retrieves sells shift management records for a specific user. This endpoint is protected and requires the user to have the SUPER ADMIN role.
     * @returns any
     * @throws ApiError
     */
    public static sellsShiftManagementControllerFindShiftForUser({
        month,
        year,
        userId,
        authorization,
    }: {
        /**
         * The month for which to retrieve sells shift records (1-12)
         */
        month: number,
        /**
         * The year for which to retrieve sells shift records
         */
        year: number,
        /**
         * The ID of the user whose sells shift management records are being retrieved
         */
        userId: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<GetUserSellsShiftSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sells-shift-management/{userId}',
            path: {
                'userId': userId,
            },
            headers: {
                'Authorization': authorization,
            },
            query: {
                'month': month,
                'year': year,
            },
        });
    }
}
