/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RequestShiftExchangeDto = {
    /**
     * Date for which the shift exchange is requested
     */
    exchangeDate: string;
    /**
     * Current assigned shift
     */
    originalShift: RequestShiftExchangeDto.originalShift;
    /**
     * Requested new shift
     */
    newShift: RequestShiftExchangeDto.newShift;
    /**
     * Reason for the shift exchange request
     */
    reason?: string;
};
export namespace RequestShiftExchangeDto {
    /**
     * Current assigned shift
     */
    export enum originalShift {
        MORNING = 'MORNING',
        EVENING = 'EVENING',
        NIGHT = 'NIGHT',
    }
    /**
     * Requested new shift
     */
    export enum newShift {
        MORNING = 'MORNING',
        EVENING = 'EVENING',
        NIGHT = 'NIGHT',
    }
}

