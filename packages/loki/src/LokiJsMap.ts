/* eslint-disable @typescript-eslint/require-await */
import { DatabaseType, IDatabaseMap } from "@nmshd/db-abstractions";

export class LokiJsMap implements IDatabaseMap {
    public readonly name: string;
    public readonly databaseType = DatabaseType.LokiJs;

    private _map: Map<string, any>;

    public constructor(private readonly collection: Collection<any>) {
        this.collection = collection;
        this.name = collection.name;
    }

    public async set(name: string, value: any): Promise<void> {
        if (typeof this._map === "undefined") {
            await this.initMap();
        }
        const current = this._map.get(name);

        this._map.set(name, { name: name, value: value });

        const document = this.collection.chain().find({ name: name }).limit(1).data();

        if (!current || document.length === 0) {
            this.collection.insert({ name: name, value: value });
        } else {
            this.collection.update({
                $loki: document[0].$loki,
                meta: document[0].meta,
                name: name,
                value: value
            });
        }
    }

    public async get(name: string): Promise<any> {
        if (typeof this._map === "undefined") {
            await this.initMap();
        }

        const document = this._map.get(name);
        if (typeof document !== "undefined") {
            return document.value;
        }

        return null;
    }

    public async delete(name: string): Promise<boolean> {
        if (!this._map.has(name)) {
            return false;
        }

        this._map.delete(name);
        this.collection.chain().find({ name: name }).remove();
        return true;
    }

    private async initMap(): Promise<Map<string, any>> {
        const items: Map<string, any> = new Map<string, any>();

        const results = await this.list();
        for (const item of results) {
            items.set(item.name, { name: item.name, meta: item.meta, $loki: item.$loki, value: item.value });
        }

        this._map = items;
        return items;
    }

    public async find(regex: string): Promise<any[]> {
        return this.collection.find({ name: { $regex: regex } });
    }

    public async list(): Promise<any[]> {
        return this.collection.chain().data();
    }
}
