import { LokiJsCollectionProvider, LokiJsConnection } from "../src";

const connection = new LokiJsConnection("./db");
let database: LokiJsCollectionProvider;

beforeAll(async () => {
    database = await connection.getDatabase(Math.random().toString(36).substring(7));
});
afterAll(async () => await connection.close());

async function getRandomCollection() {
    return await database.getCollection(Math.random().toString(36).substring(7));
}

describe("DatabaseCollection", () => {
    test("should save a value and get the same back", async function () {
        const db = await getRandomCollection();

        const entry = { id: "test", name: "testtest" };

        const createdEntry = await db.create(entry);
        expect(createdEntry.id).toEqual(entry.id);
        expect(createdEntry.name).toEqual(entry.name);

        await db.create({ id: "test2", name: "asd" });

        const all = await db.list();
        expect(all).toHaveLength(2);

        const queriedEntries = await db.find({ id: { $eq: "test" } });
        expect(queriedEntries).toHaveLength(1);
        expect(queriedEntries[0].name).toEqual(entry.name);

        const queriedEntry = await db.findOne({ id: { $eq: "test" } });
        expect(queriedEntry.name).toEqual(entry.name);
    });

    test("should query elements", async function () {
        const db = await getRandomCollection();

        for (let i = 1; i <= 10; i++) {
            await db.create({ id: i, count: i });
        }

        const all = await db.list();
        expect(all).toHaveLength(10);

        const queriedList = await db.find({ count: { $gt: 5 } });
        expect(queriedList).toHaveLength(5);
    });

    test("should query deep elements", async function () {
        const db = await getRandomCollection();

        let bool = true;
        for (let i = 1; i <= 10; i++) {
            bool = !bool;
            await db.create({ id: i, obj: { count: i }, x: bool });
        }

        const all = await db.list();
        expect(all).toHaveLength(10);

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const queriedList = await db.find({ "obj.count": { $gt: 5 }, x: true });
        expect(queriedList).toHaveLength(3);
    });

    test("should delete elements", async function () {
        const db = await getRandomCollection();

        let bool = true;
        for (let i = 1; i <= 10; i++) {
            bool = !bool;
            await db.create({ id: i, bool: bool });
        }

        const all = await db.list();
        expect(all).toHaveLength(10);

        await db.delete({ bool: { $eq: false } });

        const all2 = await db.list();
        expect(all2).toHaveLength(5);
    });

    test("should find one element in the collection", async function () {
        const db = await getRandomCollection();
        await db.create({ id: "test", value: "test" });
        await db.create({ id: "test2", value: "test2" });

        const value = await db.findOne({ id: "test" });
        expect(value).not.toBeUndefined();
        expect(value.value).not.toBeUndefined();
        expect(value.value).toEqual("test");
    });

    test("should update a value", async function () {
        const db = await getRandomCollection();

        const value = await db.create({ id: "test", value: "tes" });

        await db.update(value, { id: "test", value: "test" });

        const queriedValue = await db.findOne({ id: "test" });
        expect(queriedValue).not.toBeUndefined();
        expect(queriedValue.value).not.toBeUndefined();
        expect(queriedValue.value).toEqual("test");
    });

    test("should get the count of objects", async function () {
        const db = await getRandomCollection();

        let count = await db.count();
        expect(count).toStrictEqual(0);

        await db.create({ id: "test", value: "a-string" });
        await db.create({ id: "test", value: "a-string" });
        await db.create({ id: "test", value: "another-string" });

        count = await db.count();
        expect(count).toStrictEqual(3);

        count = await db.count({ value: "a-string" });
        expect(count).toStrictEqual(2);
    });

    test("should check if objects exist", async function () {
        const db = await getRandomCollection();

        let exists = await db.exists({});
        expect(exists).toStrictEqual(false);

        await db.create({ id: "test", value: "a-string" });
        await db.create({ id: "test", value: "a-string" });

        exists = await db.exists();
        expect(exists).toStrictEqual(true);

        exists = await db.exists({ value: "a-string" });
        expect(exists).toStrictEqual(true);

        exists = await db.exists({ value: "another-string" });
        expect(exists).toStrictEqual(false);
    });

    test("should query with paging", async () => {
        const db = await getRandomCollection();

        await db.create({ id: "id1", value: "a-string" });
        await db.create({ id: "id2", value: "another-string" });

        const find1 = await db.find(undefined, { skip: 0, limit: 1 });
        expect(find1).toHaveLength(1);

        const find2 = await db.find(undefined, { skip: 1, limit: 1 });
        expect(find2).toHaveLength(1);

        expect(find1[0].id).not.toEqual(find2[0].id);
        expect(find1[0].value).not.toEqual(find2[0].value);
    });
});
