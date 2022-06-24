import { LokiJsCollectionProvider, LokiJsConnection } from "../src";

const connection = LokiJsConnection.inMemory();
let database: LokiJsCollectionProvider;

beforeAll(async () => {
    database = await connection.getDatabase(Math.random().toString(36).substring(7));
});
afterAll(async () => await connection.close());

async function getRandomMap() {
    const name = Math.random().toString(36).substring(7);
    return await database.getMap(name);
}

describe("DatabaseMap", () => {
    test("should save a value and get the same back", async function () {
        const db = await getRandomMap();

        const value = { size: 2, name: "test" };

        await db.set("test", value);

        const queried = await db.get("test");
        expect(queried).not.toBeUndefined();
        expect(queried).toStrictEqual(value);
    });

    test("should list the elements", async function () {
        const db = await getRandomMap();

        await db.set("test", { size: 1, name: "test" });
        await db.set("test1", { size: 2, name: "test" });
        await db.set("ttest2", { size: 3, name: "test" });

        const queriedList = await db.list();
        expect(queriedList).not.toBeUndefined();
        expect(queriedList).toHaveLength(3);

        const filteredList = await db.find("ttest");
        expect(filteredList).not.toBeUndefined();
        expect(filteredList).toHaveLength(1);
        expect(filteredList[0].value.size).toEqual(3);
    });

    test("should find a value by regex", async function () {
        const db = await getRandomMap();

        await db.set("asd", { size: 1, name: "first" });
        await db.set("test", { size: 2, name: "second" });

        const value = { size: 3, name: "third" };
        await db.set("key", value);

        const filteredList = await db.find("^k.*");
        expect(filteredList).not.toBeUndefined();
        expect(filteredList).toHaveLength(1);
        expect(filteredList[0].value).toStrictEqual(value);
    });

    test("should delete a value", async function () {
        const db = await getRandomMap();

        await db.set("test", "test");
        expect(await db.list()).toHaveLength(1);

        await db.delete("test");
        expect(await db.list()).toHaveLength(0);
    });

    test("should not delete values that don't meet the conditions", async function () {
        const db = await getRandomMap();

        await db.set("donotdelete", "bla");

        await db.set("test", "test");

        expect(await db.list()).toHaveLength(2);

        await db.delete("test");
        expect(await db.list()).toHaveLength(1);
    });

    test("should update a value", async function () {
        const db = await getRandomMap();

        await db.set("test", "test");
        expect(await db.get("test")).toEqual("test");

        await db.set("test", "test2");
        expect(await db.get("test")).toEqual("test2");
    });
});
