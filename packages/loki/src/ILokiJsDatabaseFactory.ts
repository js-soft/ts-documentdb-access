import { LokiJsOptions } from "./LokiJsOptions";

export interface ILokiJsDatabaseFactory {
    create(filename: string, options?: LokiJsOptions): Loki;
}
