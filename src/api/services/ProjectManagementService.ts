/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientCreateSuccessDto } from '../models/ClientCreateSuccessDto';
import type { ClientDeleteSuccessDto } from '../models/ClientDeleteSuccessDto';
import type { ClientListSuccessDto } from '../models/ClientListSuccessDto';
import type { ClientUpdateSuccessDto } from '../models/ClientUpdateSuccessDto';
import type { CreateClientDto } from '../models/CreateClientDto';
import type { CreateProfileDto } from '../models/CreateProfileDto';
import type { CreateProjectDto } from '../models/CreateProjectDto';
import type { ProfileCreateSuccessDto } from '../models/ProfileCreateSuccessDto';
import type { ProfileDeleteSuccessDto } from '../models/ProfileDeleteSuccessDto';
import type { ProfileListSuccessDto } from '../models/ProfileListSuccessDto';
import type { ProfileUpdateSuccessDto } from '../models/ProfileUpdateSuccessDto';
import type { ProjectByIdSuccessDto } from '../models/ProjectByIdSuccessDto';
import type { ProjectCreateSuccessDto } from '../models/ProjectCreateSuccessDto';
import type { ProjectDeleteSuccessDto } from '../models/ProjectDeleteSuccessDto';
import type { ProjectListSuccessDto } from '../models/ProjectListSuccessDto';
import type { ProjectUpdateSuccessDto } from '../models/ProjectUpdateSuccessDto';
import type { UpdateClientDto } from '../models/UpdateClientDto';
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { UpdateProjectDto } from '../models/UpdateProjectDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectManagementService {
    /**
     * Create project
     * Creates a new project record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerCreate({
        authorization,
        requestBody,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: CreateProjectDto,
    }): CancelablePromise<ProjectCreateSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/project',
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List projects
     * Retrieves a list of projects with optional filtering.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerFindAll({
        pageNo,
        pageSize,
        authorization,
        searchKey,
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
         * Bearer token
         */
        authorization: string,
        /**
         * Optional free-text search term; can be null or empty
         */
        searchKey?: string,
    }): CancelablePromise<ProjectListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/project',
            headers: {
                'Authorization': authorization,
            },
            query: {
                'pageNo': pageNo,
                'pageSize': pageSize,
                'searchKey': searchKey,
            },
        });
    }
    /**
     * Create client
     * Creates a new client record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerCreateClient({
        authorization,
        requestBody,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: CreateClientDto,
    }): CancelablePromise<ClientCreateSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/project/client',
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List clients
     * Retrieves all clients.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerGetClients({
        authorization,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<ClientListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/project/client',
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Create profile
     * Creates a new profile record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerCreateProfile({
        authorization,
        requestBody,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: CreateProfileDto,
    }): CancelablePromise<ProfileCreateSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/project/profile',
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List profiles
     * Retrieves all profiles.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerGetProfiles({
        authorization,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<ProfileListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/project/profile',
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Get project by ID
     * Retrieves details of a specific project.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerFindOne({
        id,
        authorization,
    }: {
        /**
         * The ID of the project to retrieve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<ProjectByIdSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/project/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Update project
     * Updates an existing project record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerUpdate({
        id,
        authorization,
        requestBody,
    }: {
        /**
         * The ID of the project to retrieve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: UpdateProjectDto,
    }): CancelablePromise<ProjectUpdateSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/project/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete project
     * Deletes a project record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerRemove({
        id,
        authorization,
    }: {
        /**
         * The ID of the project to retrieve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<ProjectDeleteSuccessDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/project/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Update client
     * Updates an existing client record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerUpdateClient({
        id,
        authorization,
        requestBody,
    }: {
        /**
         * The ID of the project to retrieve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: UpdateClientDto,
    }): CancelablePromise<ClientUpdateSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/project/client/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete client
     * Deletes a client record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerDeleteClient({
        id,
        authorization,
    }: {
        /**
         * The ID of the client to retrieve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<ClientDeleteSuccessDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/project/client/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
    /**
     * Update profile
     * Updates an existing profile record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerUpdateProfile({
        id,
        authorization,
        requestBody,
    }: {
        /**
         * The ID of the profile to retrieve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: UpdateProfileDto,
    }): CancelablePromise<ProfileUpdateSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/project/profile/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete profile
     * Deletes a profile record.
     * @returns any
     * @throws ApiError
     */
    public static projectControllerDeleteProfile({
        id,
        authorization,
    }: {
        /**
         * The ID of the profile to retrieve
         */
        id: string,
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<ProfileDeleteSuccessDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/project/profile/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Authorization': authorization,
            },
        });
    }
}
