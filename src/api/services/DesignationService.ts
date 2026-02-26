/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDesignationDto } from '../models/CreateDesignationDto';
import type { DesignationListSuccessDto } from '../models/DesignationListSuccessDto';
import type { DesignationSuccessDto } from '../models/DesignationSuccessDto';
import type { UpdateDesignationDto } from '../models/UpdateDesignationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DesignationService {
    /**
     * Create designation
     * Creates a new job designation in the organization.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerCreate({
        requestBody,
    }: {
        requestBody: CreateDesignationDto,
    }): CancelablePromise<DesignationSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/designation',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List designations
     * Retrieves a list of job designations with optional filtering.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerFindAll({
        pageNo,
        pageSize,
        searchKey = '',
    }: {
        /**
         * The page number for pagination (1-based index)
         */
        pageNo: number,
        /**
         * The number of items per page (1-100)
         */
        pageSize: number,
        /**
         * Optional search term to filter designations
         */
        searchKey?: string,
    }): CancelablePromise<DesignationListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/designation',
            query: {
                'pageNo': pageNo,
                'pageSize': pageSize,
                'searchKey': searchKey,
            },
        });
    }
    /**
     * Get designation by ID
     * Retrieves details of a specific job designation.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerFindOne({
        id,
    }: {
        /**
         * The ID of the designation to retrieve
         */
        id: string,
    }): CancelablePromise<DesignationSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/designation/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update designation
     * Updates an existing job designation's details.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerUpdate({
        id,
        requestBody,
    }: {
        /**
         * The ID of the designation to update
         */
        id: string,
        requestBody: UpdateDesignationDto,
    }): CancelablePromise<DesignationSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/designation/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete designation
     * Deletes a job designation by its ID.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerRemove({
        id,
    }: {
        /**
         * The ID of the designation to delete
         */
        id: string,
    }): CancelablePromise<DesignationSuccessDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/designation/{id}',
            path: {
                'id': id,
            },
        });
    }
}
