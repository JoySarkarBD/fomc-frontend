/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LeaveRequestDto = {
    /**
     * The type of the leave request - SICK_LEAVE, CASUAL_LEAVE, GOVERNMENT_FESTIVAL_HOLIDAY
     */
    type: LeaveRequestDto.type;
    /**
     * The start date of the leave request UTC format
     */
    startDate: string;
    /**
     * The end date of the leave request UTC format
     */
    endDate: string;
    /**
     * The reason for the leave request
     */
    reason: string;
};
export namespace LeaveRequestDto {
    /**
     * The type of the leave request - SICK_LEAVE, CASUAL_LEAVE, GOVERNMENT_FESTIVAL_HOLIDAY
     */
    export enum type {
        SICK_LEAVE = 'SICK_LEAVE',
        CASUAL_LEAVE = 'CASUAL_LEAVE',
        GOVERNMENT_FESTIVAL_HOLIDAY = 'GOVERNMENT_FESTIVAL_HOLIDAY',
    }
}

