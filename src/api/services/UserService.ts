/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Object } from '../models/Object';
import type { UpdateUserProfileDto } from '../models/UpdateUserProfileDto';
import type { UserProfileSuccessDto } from '../models/UserProfileSuccessDto';
import type { UserProfileUpdateSuccessDto } from '../models/UserProfileUpdateSuccessDto';
import type { UsersListSuccessDto } from '../models/UsersListSuccessDto';
import type { UserSuccessDto } from '../models/UserSuccessDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * List users
     * Retrieves a list of users with optional filtering.
     * @returns any
     * @throws ApiError
     */
    public static userControllerGetUsers({
        pageNo,
        pageSize,
        searchKey,
        role,
        department,
        designation,
        search,
    }: {
        /**
         * Page number, starts from 1
         */
        pageNo: number,
        /**
         * Items per page
         */
        pageSize: number,
        /**
         * Optional free-text search term; can be null or empty
         */
        searchKey?: string,
        /**
         * Filter users by role IDs (comma-separated or array)
         */
        role?: Object,
        /**
         * Filter users by department IDs (comma-separated or array)
         */
        department?: Object,
        /**
         * Filter users by designation IDs (comma-separated or array)
         */
        designation?: Object,
        /**
         * Search keyword
         */
        search?: string,
    }): CancelablePromise<UsersListSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user',
            query: {
                'pageNo': pageNo,
                'pageSize': pageSize,
                'searchKey': searchKey,
                'role': role,
                'department': department,
                'designation': designation,
                'search': search,
            },
        });
    }
    /**
     * Get user by ID
     * Retrieves details of a specific user.
     * @returns any
     * @throws ApiError
     */
    public static userControllerGetUser({
        id,
    }: {
        /**
         * The ID of the department to retrieve
         */
        id: string,
    }): CancelablePromise<UserSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get my profile
     * Retrieves the profile of the authenticated user.
     * @returns any
     * @throws ApiError
     */
    public static userControllerGetProfile(): CancelablePromise<UserProfileSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/profile/me',
        });
    }
    /**
     * Update my profile
     * Updates the authenticated user's name and/or avatar.
     * @returns any
     * @throws ApiError
     */
    public static userControllerUpdateProfile({
        requestBody,
    }: {
        requestBody: UpdateUserProfileDto,
    }): CancelablePromise<UserProfileUpdateSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/user/profile/me',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
