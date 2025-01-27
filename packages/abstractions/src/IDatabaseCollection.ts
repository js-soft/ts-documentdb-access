import { DatabaseType } from "./DatabaseType";

export interface DatabasePaginationOptions {
    limit?: number;
    skip?: number;
}

export interface DatabaseSortOptions {
    sortBy: string;
    sortOrder: "asc" | "desc";
}

export interface IDatabaseCollection {
    readonly databaseType: DatabaseType;
    readonly name: string;

    create(object: any): Promise<any>;

    read(id: string): Promise<any>;

    update(oldDoc: any, data: any): Promise<any>;

    delete(query: any): Promise<boolean>;

    list(): Promise<any[]>;

    find(query?: any, paginationOptions?: DatabasePaginationOptions, sortOptions?: DatabaseSortOptions): Promise<any[]>;

    findOne(query?: any): Promise<any>;

    count(query?: any): Promise<number>;

    exists(query?: any): Promise<boolean>;
}
