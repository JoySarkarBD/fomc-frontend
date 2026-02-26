/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRoleDto } from '../models/CreateRoleDto';
import type { RoleByIdSuccessDto } from '../models/RoleByIdSuccessDto';
import type { RoleCreateSuccessDto } from '../models/RoleCreateSuccessDto';
import type { RoleDeleteSuccessDto } from '../models/RoleDeleteSuccessDto';
import type { RolePatchSuccessDto } from '../models/RolePatchSuccessDto';
import type { RolesListSuccessDto } from '../models/RolesListSuccessDto';
import type { UpdateRoleDto } from '../models/UpdateRoleDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleService {
    /**
     * Create role
     * Creates a new user role in the system.
     * @returns any
     * @throws ApiError
     */
    public static roleControllerCreate({
        requestBody,
    }: {
        requestBody: CreateRoleDto,
    }): CancelablePromise<RoleCreateSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/role',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List roles
     * Retrieves a list of user roles with optional filtering.
     * @returns any
     * @throws ApiError
     */
    public static roleControllerFindAll({
        pageNo,
        pageSize,
        searchKey = '',
    }: {
        /**
         * The page number for pagination
         */
        pageNo: number,
        /**
         * The number of items per page for pagination
         */
        pageSize: number,
        /**
         * Search term to filter roles by name or description
         */
        searchKey?: string,
    }): CancelablePromise<RolesListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/role',
            query: {
                'pageNo': pageNo,
                'pageSize': pageSize,
                'searchKey': searchKey,
            },
        });
    }
    /**
     * Get role by ID
     * Retrieves details of a specific user role.
     * @returns any
     * @throws ApiError
     */
    public static roleControllerFindOne({
        id,
    }: {
        /**
         * The ID of the department to retrieve
         */
        id: string,
    }): CancelablePromise<RoleByIdSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/role/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update role
     * Updates an existing user role's details.
     * @returns any
     * @throws ApiError
     */
    public static roleControllerUpdate({
        id,
        requestBody,
    }: {
        /**
         * The ID of the department to retrieve
         */
        id: string,
        requestBody: UpdateRoleDto,
    }): CancelablePromise<RolePatchSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/role/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete role
     * Deletes a user role by its ID.
     * @returns any
     * @throws ApiError
     */
    public static roleControllerRemove({
        id,
    }: {
        /**
         * The ID of the department to retrieve
         */
        id: string,
    }): CancelablePromise<RoleDeleteSuccessDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/role/{id}',
            path: {
                'id': id,
            },
        });
    }
}
