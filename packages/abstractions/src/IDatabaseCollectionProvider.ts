import { IDatabaseCollection, IDatabaseMap } from ".";

export interface IDatabaseCollectionProvider {
    getCollection(name: string): Promise<IDatabaseCollection>;
    getMap(name: string): Promise<IDatabaseMap>;
    close(): Promise<void>;
}
