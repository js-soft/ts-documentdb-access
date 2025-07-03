import { IDatabaseCollectionProvider } from "@js-soft/docdb-access-abstractions";
import { LokiJsCollection } from "./LokiJsCollection";
import { LokiJsMap } from "./LokiJsMap";

export class LokiJsCollectionProvider implements IDatabaseCollectionProvider {
    public constructor(
        private readonly db: Loki,
        private readonly onClosed: Function
    ) {}

    private getLokidbCollection(name: string, uniqueIndexes?: string[]) {
        let collection = this.db.getCollection(name);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (collection === null) {
            collection = this.db.addCollection(name, { unique: uniqueIndexes });
        }

        return collection;
    }

    public getCollection(name: string, uniqueIndexes?: string[]): Promise<LokiJsCollection> {
        const collection = new LokiJsCollection(this.getLokidbCollection(name, uniqueIndexes));
        return Promise.resolve(collection);
    }

    public getMap(name: string): Promise<LokiJsMap> {
        const map = new LokiJsMap(this.getLokidbCollection(name));
        return Promise.resolve(map);
    }

    public async close(): Promise<void> {
        await new Promise((resolve) => this.db.saveDatabase(resolve));
        await new Promise((resolve) => this.db.close(resolve));
        this.onClosed();
    }
}
