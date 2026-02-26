/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApproveShiftExchangeSuccessDto } from '../models/ApproveShiftExchangeSuccessDto';
import type { CreateSellsShiftManagementDto } from '../models/CreateSellsShiftManagementDto';
import type { CreateSellsShiftManagementSuccessDto } from '../models/CreateSellsShiftManagementSuccessDto';
import type { GetMyShiftExchangesSuccessDto } from '../models/GetMyShiftExchangesSuccessDto';
import type { GetPendingShiftExchangesSuccessDto } from '../models/GetPendingShiftExchangesSuccessDto';
import type { GetUserSellsShiftSuccessDto } from '../models/GetUserSellsShiftSuccessDto';
import type { RejectShiftExchangeSuccessDto } from '../models/RejectShiftExchangeSuccessDto';
import type { RequestShiftExchangeDto } from '../models/RequestShiftExchangeDto';
import type { ShiftExchangeRequestSuccessDto } from '../models/ShiftExchangeRequestSuccessDto';
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
    /**
     * Request a shift exchange
     * Allows a Sales user to request a shift exchange.
     * @returns any
     * @throws ApiError
     */
    public static sellsShiftManagementControllerRequestShiftExchange({
        authorization,
        requestBody,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: RequestShiftExchangeDto,
    }): CancelablePromise<ShiftExchangeRequestSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sells-shift-management/exchange/request',
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Approve a shift exchange
     * Required role: SUPER ADMIN, DIRECTOR, or PROJECT MANAGER
     * @returns any
     * @throws ApiError
     */
    public static sellsShiftManagementControllerApproveShiftExchange({
        exchangeId,
        authorization,
    }: {
        /**
         * The ID of the shift exchange request to approve
         */
        exchangeId: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<ApproveShiftExchangeSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/sells-shift-management/exchange/approve/{exchangeId}',
            path: {
                'exchangeId': exchangeId,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Reject a shift exchange
     * Required role: SUPER ADMIN, DIRECTOR, or PROJECT MANAGER
     * @returns any
     * @throws ApiError
     */
    public static sellsShiftManagementControllerRejectShiftExchange({
        exchangeId,
        authorization,
    }: {
        /**
         * The ID of the shift exchange request to reject
         */
        exchangeId: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<RejectShiftExchangeSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/sells-shift-management/exchange/reject/{exchangeId}',
            path: {
                'exchangeId': exchangeId,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Get my shift exchanges
     * Retrieves the logged-in user's shift exchange requests.
     * @returns any
     * @throws ApiError
     */
    public static sellsShiftManagementControllerGetMyShiftExchanges({
        authorization,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<GetMyShiftExchangesSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sells-shift-management/exchange/my',
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Get pending shift exchanges for approval
     * Required role: SUPER ADMIN, DIRECTOR, or PROJECT MANAGER
     * @returns any
     * @throws ApiError
     */
    public static sellsShiftManagementControllerGetPendingShiftExchanges({
        authorization,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<GetPendingShiftExchangesSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sells-shift-management/exchange/pending',
            headers: {
                'Authorization': authorization,
            },
        });
    }
}
