import { IDatabaseConnection } from "@nmshd/db-abstractions";
import { MongoClient, MongoClientOptions } from "mongodb";
import { MongoDbCollectionProvider } from "./MongoDbCollectionProvider";

export class MongoDbConnection implements IDatabaseConnection {
    private readonly _client: MongoClient;
    public get client(): MongoClient {
        return this._client;
    }

    public constructor(connectionString: string, config: MongoClientOptions = {}) {
        this._client = new MongoClient(connectionString, config);
    }

    public async connect(): Promise<this> {
        await this._client.connect();
        return this;
    }

    public getDatabase(name: string): Promise<MongoDbCollectionProvider> {
        const collectionProvider = new MongoDbCollectionProvider(this._client.db(name));
        return Promise.resolve(collectionProvider);
    }

    public async close(): Promise<void> {
        await this._client.close();
    }
}
