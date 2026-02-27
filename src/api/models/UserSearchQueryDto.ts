/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserSearchQueryDto = {
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
    /**
     * Filter users by role IDs (comma-separated or array)
     */
    role?: Record<string, any>;
    /**
     * Filter users by department IDs (comma-separated or array)
     */
    department?: Record<string, any>;
    /**
     * Filter users by designation IDs (comma-separated or array)
     */
    designation?: Record<string, any>;
};

