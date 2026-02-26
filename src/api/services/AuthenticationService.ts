/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangePasswordDto } from '../models/ChangePasswordDto';
import type { ChangePasswordSuccessDto } from '../models/ChangePasswordSuccessDto';
import type { CreateUserDto } from '../models/CreateUserDto';
import type { ForgotPasswordDto } from '../models/ForgotPasswordDto';
import type { ForgotPasswordSuccessDto } from '../models/ForgotPasswordSuccessDto';
import type { LoginDto } from '../models/LoginDto';
import type { LoginSuccessDto } from '../models/LoginSuccessDto';
import type { LogoutSuccessDto } from '../models/LogoutSuccessDto';
import type { RegistrationSuccessDto } from '../models/RegistrationSuccessDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';
import type { ResetPasswordSuccessDto } from '../models/ResetPasswordSuccessDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register a new user account
     * Creates a new user account with the provided details.
     * @returns any
     * @throws ApiError
     */
    public static authControllerRegister({
        requestBody,
    }: {
        requestBody: CreateUserDto,
    }): CancelablePromise<RegistrationSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * User login
     * Authenticates a user with email and password, returning a JWT token.
     * @returns any
     * @throws ApiError
     */
    public static authControllerLogin({
        requestBody,
    }: {
        requestBody: LoginDto,
    }): CancelablePromise<LoginSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Forgot password
     * Sends a password reset OTP to the user's email.
     * @returns any
     * @throws ApiError
     */
    public static authControllerForgot({
        xDeviceId,
        requestBody,
    }: {
        /**
         * Unique identifier for the user's device, used for throttling password reset requests.
         */
        xDeviceId: string,
        requestBody: ForgotPasswordDto,
    }): CancelablePromise<ForgotPasswordSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/forgot-password',
            headers: {
                'x-device-id': xDeviceId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reset password
     * Resets the user's password using a valid OTP.
     * @returns any
     * @throws ApiError
     */
    public static authControllerReset({
        xDeviceId,
        requestBody,
    }: {
        /**
         * Unique identifier for the user's device, used for throttling password reset requests.
         */
        xDeviceId: string,
        requestBody: ResetPasswordDto,
    }): CancelablePromise<ResetPasswordSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/reset-password',
            headers: {
                'x-device-id': xDeviceId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Change password
     * Changes the authenticated user's password.
     * @returns any
     * @throws ApiError
     */
    public static authControllerChange({
        xDeviceId,
        authorization,
        requestBody,
    }: {
        /**
         * Unique identifier for the user's device, used for throttling password change requests.
         */
        xDeviceId: string,
        /**
         * Bearer token
         */
        authorization: string,
        requestBody: ChangePasswordDto,
    }): CancelablePromise<ChangePasswordSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/change-password',
            headers: {
                'x-device-id': xDeviceId,
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * User logout
     * Invalidates the current authentication token.
     * @returns any
     * @throws ApiError
     */
    public static authControllerLogout({
        authorization,
    }: {
        /**
         * Bearer token
         */
        authorization: string,
    }): CancelablePromise<LogoutSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
            headers: {
                'Authorization': authorization,
            },
        });
    }
}
