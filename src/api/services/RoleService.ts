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
    public static roleControllerCreateRole({
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
    public static roleControllerFindRoles(): CancelablePromise<RolesListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/role',
        });
    }
    /**
     * Get role by ID
     * Retrieves details of a specific user role.
     * @returns any
     * @throws ApiError
     */
    public static roleControllerFindRoleById(): CancelablePromise<RoleByIdSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/role/{id}',
        });
    }
    /**
     * Update role
     * Updates an existing user role's details.
     * @returns any
     * @throws ApiError
     */
    public static roleControllerUpdateRoleById({
        requestBody,
    }: {
        requestBody: UpdateRoleDto,
    }): CancelablePromise<RolePatchSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/role/{id}',
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
    public static roleControllerDeleteRoleById(): CancelablePromise<RoleDeleteSuccessDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/role/{id}',
        });
    }
}
