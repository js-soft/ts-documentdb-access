import { MongoDbConnection } from "@js-soft/docdb-access-mongo";
import { TestRunner } from "./TestRunner";

const connection = new MongoDbConnection(process.env.CONNECTION_STRING!);
const testRunner = new TestRunner();

beforeAll(async () => {
    await connection.connect();
    const db = await connection.getDatabase(`x${Math.random().toString(36).substring(7)}`);
    await testRunner.init(db);
});

afterAll(async () => await connection.close());

// eslint-disable-next-line jest/valid-describe-callback
describe("mongodb test", () => testRunner.run());
