/* eslint-disable @typescript-eslint/require-await */
import { DatabasePaginationOptions, DatabaseType, IDatabaseCollection } from "@js-soft/docdb-access-abstractions";

export class LokiJsCollection implements IDatabaseCollection {
    public readonly name: string;
    public readonly databaseType = DatabaseType.LokiJs;

    public constructor(private readonly collection: Collection<any>) {
        this.name = collection.name;
    }

    public async create(object: any): Promise<any> {
        if (!object) return;
        if (typeof object.toJSON === "function") {
            object = object.toJSON();
        }

        this.collection.insert(object);

        return object;
    }

    public async read(id: string): Promise<any> {
        const results = this.collection.chain().find({ id: id }).limit(1).data();

        return results[0];
    }

    public async update(oldDocument: any, data: any): Promise<any> {
        if (typeof data.toJSON === "function") {
            data = data.toJSON();
        }

        data.$loki = oldDocument.$loki;
        data.meta = oldDocument.meta;

        this.collection.update(document);
        return data;
    }

    public async delete(query: any): Promise<boolean> {
        if (typeof query === "string") {
            query = { id: query };
        }

        if (typeof query.toJSON === "function") {
            query = query.toJSON();
        }

        const resultset = this.collection.chain().find(query);
        if (resultset.data().length < 1) {
            return false;
        }

        resultset.remove();
        return true;
    }

    public async list(): Promise<any[]> {
        return this.collection.chain().data();
    }

    public async find(query?: any, paginationOptions?: DatabasePaginationOptions): Promise<any[]> {
        let cursor = this.collection.chain().find(query);

        if (paginationOptions) {
            if (paginationOptions.skip) cursor = cursor.offset(paginationOptions.skip);
            if (paginationOptions.limit) cursor = cursor.limit(paginationOptions.limit);
        }

        return cursor.data();
    }

    public async findOne(query?: any): Promise<any> {
        const results = this.collection.chain().find(query).limit(1).data();
        return results[0];
    }

    public async count(query?: any): Promise<number> {
        const count = this.collection.count(query);
        return count;
    }

    public async exists(query?: any): Promise<boolean> {
        const count = await this.count(query);
        return count > 0;
    }
}
