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
        requestBody,
    }: {
        requestBody: ForgotPasswordDto,
    }): CancelablePromise<ForgotPasswordSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/forgot-password',
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
        requestBody,
    }: {
        requestBody: ResetPasswordDto,
    }): CancelablePromise<ResetPasswordSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/reset-password',
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
        requestBody,
    }: {
        requestBody: ChangePasswordDto,
    }): CancelablePromise<ChangePasswordSuccessDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/change-password',
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
    public static authControllerLogout(): CancelablePromise<LogoutSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
        });
    }
}
