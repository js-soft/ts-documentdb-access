export interface ILokiJsDatabaseFactory {
    create(
        filename: string,
        options?: Partial<LokiConstructorOptions> & Partial<LokiConfigOptions> & Partial<ThrottledSaveDrainOptions>
    ): Loki;
}
