/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AttendanceByAuthorityDto = {
    /**
     * The check-in time for the attendance record (optional)
     */
    checkInTime?: string;
    /**
     * The check-out time for the attendance record (optional)
     */
    checkOutTime?: string;
    /**
     * The date(UTC) for which to mark attendance (defaults to today if not provided)
     */
    date?: string;
    /**
     * The type of attendance to mark for the user - PRESENT, LATE, ABSENT, ON_LEAVE, WEEKEND, WORK_FROM_HOME
     */
    inType: AttendanceByAuthorityDto.inType;
    /**
     * Whether the attendance is marked as late (optional)
     */
    isLate?: boolean;
};
export namespace AttendanceByAuthorityDto {
    /**
     * The type of attendance to mark for the user - PRESENT, LATE, ABSENT, ON_LEAVE, WEEKEND, WORK_FROM_HOME
     */
    export enum inType {
        PRESENT = 'PRESENT',
        LATE = 'LATE',
        ABSENT = 'ABSENT',
        ON_LEAVE = 'ON_LEAVE',
        WEEKEND = 'WEEKEND',
        WORK_FROM_HOME = 'WORK_FROM_HOME',
    }
}

