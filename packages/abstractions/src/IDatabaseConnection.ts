import { IDatabaseCollectionProvider } from "./IDatabaseCollectionProvider";

export interface IDatabaseConnection {
    getDatabase(name: string): Promise<IDatabaseCollectionProvider>;
}
