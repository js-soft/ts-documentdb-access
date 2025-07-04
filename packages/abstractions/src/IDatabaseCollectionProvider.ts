import { IDatabaseCollection, IDatabaseMap } from ".";

export interface IDatabaseCollectionProvider {
    getCollection(name: string, uniqueIndexes?: string[]): Promise<IDatabaseCollection>;
    getMap(name: string): Promise<IDatabaseMap>;
    close(): Promise<void>;
}
