/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeaveRequestApprovalSuccessDto } from '../models/LeaveRequestApprovalSuccessDto';
import type { LeaveRequestDto } from '../models/LeaveRequestDto';
import type { LeaveRequestRejectionSuccessDto } from '../models/LeaveRequestRejectionSuccessDto';
import type { LeaveRequestSuccessDto } from '../models/LeaveRequestSuccessDto';
import type { MyLeavesSuccessDto } from '../models/MyLeavesSuccessDto';
import type { PendingLeaveRequestsForAuthoritySuccessDto } from '../models/PendingLeaveRequestsForAuthoritySuccessDto';
import type { SpecificLeaveRequestSuccessDto } from '../models/SpecificLeaveRequestSuccessDto';
import type { UserSpecificLeaveSuccessDto } from '../models/UserSpecificLeaveSuccessDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LeaveManagementService {
    /**
     * Create a new leave request
     * @returns any
     * @throws ApiError
     */
    public static leaveControllerCreateLeaveRequest({
        authorization,
        requestBody,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: LeaveRequestDto,
    }): CancelablePromise<LeaveRequestSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/leave/request',
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve user-specific leaves
     * @returns any
     * @throws ApiError
     */
    public static leaveControllerGetMyLeaves({
        year,
        authorization,
    }: {
        /**
         * The year for which to retrieve leave records
         */
        year: number,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<MyLeavesSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/leave/my-leaves',
            headers: {
                'Authorization': authorization,
            },
            query: {
                'year': year,
            },
        });
    }
    /**
     * Retrieve all pending leave requests for authority
     * @returns any
     * @throws ApiError
     */
    public static leaveControllerGetAllPendingLeaveRequestsForAuthority({
        authorization,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<PendingLeaveRequestsForAuthoritySuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/leave/pending-approvals',
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Retrieve a specific leave request by ID
     * @returns any
     * @throws ApiError
     */
    public static leaveControllerGetUserSpecificLeaves({
        year,
        userId,
        authorization,
    }: {
        /**
         * The year for which to retrieve leave records
         */
        year: number,
        /**
         * The ID of the user to retrieve leave records for
         */
        userId: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<UserSpecificLeaveSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/leave/user-specific/{userId}',
            path: {
                'userId': userId,
            },
            headers: {
                'Authorization': authorization,
            },
            query: {
                'year': year,
            },
        });
    }
    /**
     * Retrieve a specific leave request by ID
     * @returns any
     * @throws ApiError
     */
    public static leaveControllerGetLeaveById({
        authorization,
        id,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
        /**
         * The ID of the leave request to retrieve
         */
        id: string,
    }): CancelablePromise<SpecificLeaveRequestSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/leave/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Approve a leave request
     * @returns any
     * @throws ApiError
     */
    public static leaveControllerApproveLeaveRequest({
        id,
        authorization,
    }: {
        /**
         * The ID of the leave request to approve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<LeaveRequestApprovalSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/leave/approve/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Reject a leave request
     * @returns any
     * @throws ApiError
     */
    public static leaveControllerRejectLeaveRequest({
        id,
        authorization,
    }: {
        /**
         * The ID of the leave request to reject
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<LeaveRequestRejectionSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/leave/reject/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
}
