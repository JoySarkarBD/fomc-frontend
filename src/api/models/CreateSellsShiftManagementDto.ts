/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSellsShiftManagementDto = {
    /**
     * The start date of the week for the sells shift management
     */
    weekStartDate: string;
    /**
     * The end date of the week for the sells shift management
     */
    weekEndDate: string;
    /**
     * The type of shift for the sells shift management - MORNING, EVENING, NIGHT
     */
    shiftType: CreateSellsShiftManagementDto.shiftType;
    /**
     * An optional note for the sells shift management
     */
    note?: string;
};
export namespace CreateSellsShiftManagementDto {
    /**
     * The type of shift for the sells shift management - MORNING, EVENING, NIGHT
     */
    export enum shiftType {
        MORNING = 'MORNING',
        EVENING = 'EVENING',
        NIGHT = 'NIGHT',
    }
}

