/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MarkAttendanceSuccessDto } from '../models/MarkAttendanceSuccessDto';
import type { MarkOutAttendanceSuccessDto } from '../models/MarkOutAttendanceSuccessDto';
import type { MyAttendanceSuccessDto } from '../models/MyAttendanceSuccessDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttendanceService {
    /**
     * Mark attendance
     * Marks the authenticated user as present.
     * @returns any
     * @throws ApiError
     */
    public static attendanceControllerPresentAttendance(): CancelablePromise<MarkAttendanceSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/attendance/present',
        });
    }
    /**
     * Get my attendance
     * Retrieves attendance records for the authenticated user.
     * @returns any
     * @throws ApiError
     */
    public static attendanceControllerGetMyAttendance({
        month,
        year,
    }: {
        /**
         * The month for which to retrieve attendance records (1-12)
         */
        month: number,
        /**
         * The year for which to retrieve attendance records
         */
        year: number,
    }): CancelablePromise<MyAttendanceSuccessDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/attendance/my-attendance',
            query: {
                'month': month,
                'year': year,
            },
        });
    }
    /**
     * Mark out attendance
     * Marks the authenticated user as out for the day.
     * @returns any
     * @throws ApiError
     */
    public static attendanceControllerOutAttendance(): CancelablePromise<MarkOutAttendanceSuccessDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/attendance/out',
        });
    }
}
