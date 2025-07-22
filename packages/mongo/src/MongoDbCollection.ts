import {
    DatabasePaginationOptions,
    DatabaseSortOptions,
    DatabaseType,
    IDatabaseCollection
} from "@js-soft/docdb-access-abstractions";
import jsonpatch from "fast-json-patch";
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
        if (typeof data.toJSON === "function") data = data.toJSON();

        const updateResult = await this.collection.replaceOne(oldDoc, data);
        if (updateResult.modifiedCount < 1) throw new Error("Document not found for updating");

        return data;
    }

    public async patch(oldDoc: any, data: any): Promise<any> {
        if (typeof data.toJSON === "function") {
            data = data.toJSON();
        }

        const patch = jsonpatch.compare(oldDoc, data);

        const patchMappedToMongoDbOps = patch
            .filter((v) => v.path !== "/_id")
            .map((op) => {
                const path = op.path.startsWith("/")
                    ? op.path.substring(1).replaceAll("/", ".")
                    : op.path.replaceAll("/", ".");

                switch (op.op) {
                    case "add":
                    case "replace":
                        return { $set: { [path]: op.value } };
                    case "remove":
                        return { $unset: { [path]: "" } };
                    case "move":
                        // TODO: hard to implement
                        // return { $set: { [op.path]: oldDoc[op.from] }, $unset: { [op.from]: "" } };
                        throw new Error("Move operation is not supported in MongoDB");
                    case "copy":
                        // TODO: hard to implement
                        // return { $set: { [op.path]: oldDoc[op.from] } };
                        throw new Error("Move operation is not supported in MongoDB");
                    case "test":
                    // Test operations are not supported in MongoDB, so we ignore them
                    case "_get":
                    default:
                        throw new Error(`Unsupported operation: ${op.op}`);
                }
            });

        const updated = await this.collection.findOneAndUpdate({ id: oldDoc.id }, patchMappedToMongoDbOps, {
            returnDocument: "after"
        });

        if (!updated) {
            throw new Error("Document not found for patching");
        }

        return updated;
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

    public async find(
        query?: any,
        paginationOptions?: DatabasePaginationOptions,
        sortOptions?: DatabaseSortOptions
    ): Promise<any> {
        let cursor = this.collection.find(removeContainsInQuery(query));

        if (sortOptions) {
            cursor = cursor.sort(sortOptions.sortBy, sortOptions.sortOrder === "asc" ? 1 : -1);
        }

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
