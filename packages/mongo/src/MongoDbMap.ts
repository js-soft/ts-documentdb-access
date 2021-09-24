import { DatabaseType, IDatabaseMap } from "@js-soft/docdb-access-abstractions";
import { Collection } from "mongodb";

export class MongoDbMap implements IDatabaseMap {
    public readonly name: string;
    public readonly databaseType = DatabaseType.MongoDb;

    public constructor(private readonly collection: Collection<any>) {
        this.name = collection.collectionName;
    }

    public async set(name: string, value: any): Promise<void> {
        await this.collection.findOneAndReplace(
            { name: name },
            {
                name: name,
                value: value
            },
            {
                upsert: true
            }
        );
    }

    public async get(name: string): Promise<any> {
        const result = await this.collection.findOne({ name: name });
        if (!result) {
            return null;
        }

        return result.value;
    }

    public async delete(name: string): Promise<boolean> {
        const result = await this.collection.findOneAndDelete({ name: name });
        return result.value !== null;
    }

    public async find(regex: string): Promise<any> {
        return await this.collection.find({ name: { $regex: regex } }).toArray();
    }

    public async list(): Promise<any[]> {
        return await this.collection.find({}).toArray();
    }
}
