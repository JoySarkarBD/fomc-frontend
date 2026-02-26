/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SearchQueryDto = {
    /**
     * The page number for pagination (1-based index)
     */
    pageNo: number;
    /**
     * The number of items per page (1-100)
     */
    pageSize: number;
    /**
     * Optional free-text search term; can be null or empty
     */
    searchKey?: string;
};

