import { IDatabaseConnection } from "@js-soft/docdb-access-abstractions";
import lokijs from "lokijs";
import { ILokiJsDatabaseFactory } from "./ILokiJsDatabaseFactory";
import { LokiJsCollectionProvider } from "./LokiJsCollectionProvider";
import { LokiJsOptions } from "./LokiJsOptions";

export class LokiJsConnection implements IDatabaseConnection {
    private readonly providers: Map<string, LokiJsCollectionProvider>;

    private static readonly defaultDatabaseFactory = {
        create: (filename: string, options?: LokiJsOptions): Loki => {
            return new lokijs(filename, options);
        }
    };

    public constructor(
        private readonly folder: string,
        private readonly databaseFactory: ILokiJsDatabaseFactory = LokiJsConnection.defaultDatabaseFactory,
        private readonly lokiJsOptions: LokiJsOptions = {}
    ) {
        this.providers = new Map();
    }

    public static fileSystem(
        folder: string,
        lokiJsOptions?: Omit<LokiJsOptions, "persistenceMethod">
    ): LokiJsConnection {
        return new LokiJsConnection(folder, this.defaultDatabaseFactory, { ...lokiJsOptions, persistenceMethod: "fs" });
    }

    public static localStorage(lokiJsOptions?: Omit<LokiJsOptions, "persistenceMethod">): LokiJsConnection {
        return new LokiJsConnection("", this.defaultDatabaseFactory, {
            ...lokiJsOptions,
            persistenceMethod: "localStorage"
        });
    }

    public static inMemory(lokiJsOptions?: Omit<LokiJsOptions, "persistenceMethod">): LokiJsConnection {
        return new LokiJsConnection("", this.defaultDatabaseFactory, { ...lokiJsOptions, persistenceMethod: "memory" });
    }

    private onCollectionClosed(name: string) {
        this.providers.delete(name);
    }

    public async deleteDatabase(name: string): Promise<void> {
        const database = await this.getDatabase(name);

        const loki = database["db"];

        await new Promise((resolve) => loki.deleteDatabase(resolve));

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
                ...this.lokiJsOptions,
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
