import { LokiJsConnection } from "@js-soft/docdb-access-loki";
import { TestRunner } from "./TestRunner";

const connection = new LokiJsConnection("./db");
const testRunner = new TestRunner();

beforeAll(async () => {
    const db = await connection.getDatabase(Math.random().toString(36).substring(7));
    await testRunner.init(db);
});

afterAll(async () => await connection.close());

describe("lokijs test", () => testRunner.run());
