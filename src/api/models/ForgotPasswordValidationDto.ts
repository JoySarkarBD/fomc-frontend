/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FieldErrorDto } from './FieldErrorDto';
export type ForgotPasswordValidationDto = {
    success: boolean;
    message: string;
    method: Record<string, any>;
    endpoint: string;
    statusCode: number;
    timestamp: string;
    errors: Array<FieldErrorDto>;
};

