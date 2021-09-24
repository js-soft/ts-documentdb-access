import { DatabasePaginationOptions, DatabaseType, IDatabaseCollection } from "@js-soft/docdb-access-abstractions";
import { Collection } from "mongodb";
import { removeContainsInQuery } from "./queryUtils";

export class MongoDbCollection implements IDatabaseCollection {
    public readonly name: string;
    public readonly databaseType = DatabaseType.MongoDb;

    public constructor(private readonly collection: Collection<any>) {
        this.name = collection.collectionName;
    }

    public async create(object: any): Promise<any> {
        if (typeof object.toJSON === "function") {
            object = object.toJSON();
        }

        const result = await this.collection.insertOne(object, { checkKeys: false });
        if (!result.acknowledged) {
            throw new Error("data was not inserted");
        }

        return await this.collection.findOne(object, {});
    }

    public async read(id: string): Promise<any> {
        const returnValue = await this.collection.findOne({ id: id });
        return returnValue;
    }

    public async update(oldDoc: any, data: any): Promise<any> {
        let doc: any;

        if (typeof data.toJSON === "function") {
            doc = data.toJSON();
        } else {
            doc = data;
        }

        await this.collection.replaceOne(oldDoc, doc);
        return data;
    }

    public async delete(query: any): Promise<boolean> {
        if (typeof query === "string") {
            query = { id: query };
        }

        if (typeof query.toJSON === "function") {
            query = query.toJSON();
        }

        const result = await this.collection.deleteMany(removeContainsInQuery(query));
        return !!result.deletedCount && result.deletedCount > 0;
    }

    public async list(): Promise<any> {
        return await this.collection.find({}).toArray();
    }

    public async find(query?: any, paginationOptions?: DatabasePaginationOptions): Promise<any> {
        let cursor = this.collection.find(removeContainsInQuery(query));

        if (paginationOptions) {
            if (paginationOptions.skip) cursor = cursor.skip(paginationOptions.skip);
            if (paginationOptions.limit) cursor = cursor.limit(paginationOptions.limit);
        }

        return await cursor.toArray();
    }

    public async findOne(query?: any): Promise<any> {
        return await this.collection.findOne(removeContainsInQuery(query), {});
    }

    public async count(query?: any): Promise<number> {
        const count = await this.collection.countDocuments(removeContainsInQuery(query), {});
        return count;
    }

    public async exists(query?: any): Promise<boolean> {
        const count = await this.collection.countDocuments(removeContainsInQuery(query), { limit: 1 });
        return count > 0;
    }
}
