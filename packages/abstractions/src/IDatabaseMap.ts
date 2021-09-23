import { DatabaseType } from "./DatabaseType";

export interface IDatabaseMap {
    readonly databaseType: DatabaseType;
    readonly name: string;

    set(name: string, value: any): Promise<void>;

    get(name: string): Promise<any>;

    delete(name: string): Promise<boolean>;

    find(regex: string): Promise<any[]>;

    list(): Promise<any[]>;
}
