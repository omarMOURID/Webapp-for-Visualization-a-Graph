import { Exclude } from "class-transformer";

export interface PaginationSchema<E> {
    items: E[];
    pages: number;
    size: number;
    count: number;
}