import { IDatabaseConnection } from "@js-soft/docdb-access-abstractions";
import Lokijs from "lokijs";
import { ILokiJsDatabaseFactory } from "./ILokiJsDatabaseFactory";
import { LokiJsCollectionProvider } from "./LokiJsCollectionProvider";

export class LokiJsConnection implements IDatabaseConnection {
    private readonly providers: Map<string, LokiJsCollectionProvider>;

    private static readonly defaultDatabaseFactory = {
        create: (filename: string, options?: LokiJsOptions): Loki => {
            return new Lokijs(filename, options);
        }
    };

    public constructor(
        private readonly folder: string,
        private readonly databaseFactory: ILokiJsDatabaseFactory = LokiJsConnection.defaultDatabaseFactory
    ) {
        this.providers = new Map();
    }

    private onCollectionClosed(name: string) {
        this.providers.delete(name);
    }

    public async getDatabase(name: string): Promise<LokiJsCollectionProvider> {
        const givenProvider = this.providers.get(name);
        if (givenProvider) {
            return givenProvider;
        }

        const that = this;
        return await new Promise((resolve) => {
            const db: Loki = this.databaseFactory.create(`${this.folder}/${name}.db`, {
                autoload: true,
                autosave: true,
                autosaveInterval: 5000,
                autoloadCallback: () => {
                    const provider = new LokiJsCollectionProvider(db, () => that.onCollectionClosed(name));
                    that.providers.set(name, provider);
                    resolve(provider);
                }
            });
        });
    }

    private async closeAllProviders() {
        const openProviders = Array.from(this.providers.values());
        const closingPromises = openProviders.map((provider) => provider.close());
        await Promise.all(closingPromises);
    }

    public async close(): Promise<void> {
        await this.closeAllProviders();
    }
}
