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
    public static designationControllerCreateDesignation({
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
    public static designationControllerFindDesignations(): CancelablePromise<DesignationListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/designation',
        });
    }
    /**
     * Get designation by ID
     * Retrieves details of a specific job designation.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerFindDepartmentById(): CancelablePromise<DesignationSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/designation/{id}',
        });
    }
    /**
     * Update designation
     * Updates an existing job designation's details.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerUpdateDesignationById({
        requestBody,
    }: {
        requestBody: UpdateDesignationDto,
    }): CancelablePromise<DesignationSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/designation/{id}',
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
    public static designationControllerDeleteDesignationById(): CancelablePromise<DesignationSuccessDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/designation/{id}',
        });
    }
    /**
     * Batch get designations
     * Retrieves multiple designations by their IDs.
     * @returns any
     * @throws ApiError
     */
    public static designationControllerFindDesignationsByIds(): CancelablePromise<DesignationListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/designation/batch',
        });
    }
}
