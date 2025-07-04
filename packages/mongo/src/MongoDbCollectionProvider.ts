import { IDatabaseCollectionProvider } from "@js-soft/docdb-access-abstractions";
import { Db } from "mongodb";
import { MongoDbCollection } from "./MongoDbCollection";
import { MongoDbMap } from "./MongoDbMap";

export class MongoDbCollectionProvider implements IDatabaseCollectionProvider {
    private readonly db: Db;

    public constructor(db: Db) {
        this.db = db;
    }

    public async getCollection(name: string, uniqueIndexes?: string[]): Promise<MongoDbCollection> {
        const collection = this.db.collection(name);
        if (uniqueIndexes && uniqueIndexes.length > 0) {
            for (const uniqueIndex of uniqueIndexes) {
                await collection.createIndex({ [uniqueIndex]: 1 }, { unique: true });
            }
        }
        return new MongoDbCollection(collection);
    }

    public async getMap(name: string): Promise<MongoDbMap> {
        const collection = this.db.collection(name);
        await collection.createIndex({ name: 1 }, { unique: true });
        return new MongoDbMap(collection);
    }

    public async close(): Promise<void> {
        // Nothing to do here
    }
}
