import { MongoDbCollectionProvider, MongoDbConnection } from "../src";

const connection = new MongoDbConnection(process.env.CONNECTION_STRING!);
let database: MongoDbCollectionProvider;

function randomString() {
    return `x${Math.random().toString(36).substring(7)}`;
}

beforeAll(async () => {
    await connection.connect();
    database = await connection.getDatabase(randomString());
});

afterAll(async () => await connection.close());

async function getRandomCollection(uniqueIndexes?: string[]) {
    return await database.getCollection(randomString(), uniqueIndexes);
}

describe("DatabaseCollection", () => {
    test("should save a value and get the same back", async function () {
        const db = await getRandomCollection();

        const entry = { id: "test", name: "testtest" };

        const createdEntry = await db.create(entry);
        expect(createdEntry.id).toBe(entry.id);
        expect(createdEntry.name).toBe(entry.name);

        await db.create({ id: "test2", name: "asd" });

        const all = await db.list();
        expect(all).toHaveLength(2);

        const queriedEntries = await db.find({ id: { $eq: "test" } });
        expect(queriedEntries).toHaveLength(1);
        expect(queriedEntries[0].name).toBe(entry.name);

        const queriedEntry = await db.findOne({ id: { $eq: "test" } });
        expect(queriedEntry.name).toBe(entry.name);
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
        expect(value).toBeDefined();
        expect(value.value).toBeDefined();
        expect(value.value).toBe("test");
    });

    test("should update a value", async function () {
        const db = await getRandomCollection();

        const value = await db.create({ id: "test", value: "tes" });

        await db.update(value, { id: "test", value: "test" });

        const queriedValue = await db.findOne({ id: "test" });
        expect(queriedValue).toBeDefined();
        expect(queriedValue.value).toBeDefined();
        expect(queriedValue.value).toBe("test");
    });

    test("should get the count of objects", async function () {
        const db = await getRandomCollection();

        let count = await db.count();
        expect(count).toBe(0);

        await db.create({ id: "test", value: "a-string" });
        await db.create({ id: "test", value: "a-string" });
        await db.create({ id: "test", value: "another-string" });

        count = await db.count();
        expect(count).toBe(3);

        count = await db.count({ value: "a-string" });
        expect(count).toBe(2);
    });

    test("should check if objects exist", async function () {
        const db = await getRandomCollection();

        let exists = await db.exists({});
        expect(exists).toBe(false);

        await db.create({ id: "test", value: "a-string" });
        await db.create({ id: "test", value: "a-string" });

        exists = await db.exists();
        expect(exists).toBe(true);

        exists = await db.exists({ value: "a-string" });
        expect(exists).toBe(true);

        exists = await db.exists({ value: "another-string" });
        expect(exists).toBe(false);
    });

    test("should find the correct entries using $contains", async function () {
        const db = await getRandomCollection();

        await db.create({ id: "test1", value: ["a-string"] });
        await db.create({ id: "test2", value: ["a-string", "another-string"] });

        const list = await db.find({ value: { $contains: "a-string" } });
        expect(list).toHaveLength(2);

        const list2 = await db.find({ value: { $contains: "another-string" } });
        expect(list2).toHaveLength(1);
    });

    test("should query with paging", async () => {
        const db = await getRandomCollection();

        await db.create({ id: "id1", value: "a-string" });
        await db.create({ id: "id2", value: "another-string" });

        const find1 = await db.find(undefined, { skip: 0, limit: 1 });
        expect(find1).toHaveLength(1);

        const find2 = await db.find(undefined, { skip: 1, limit: 1 });
        expect(find2).toHaveLength(1);

        expect(find1[0].id).not.toBe(find2[0].id);
        expect(find1[0].value).not.toBe(find2[0].value);
    });

    test("should sort ascending", async () => {
        const db = await getRandomCollection();

        await db.create({ id: "id1", value: "1" });
        await db.create({ id: "id2", value: "2" });

        const find = await db.find(undefined, undefined, { sortBy: "value", sortOrder: "asc" });
        expect(find).toHaveLength(2);

        expect(find[0].id).toBe("id1");
        expect(find[1].id).toBe("id2");
    });

    test("should sort descending", async () => {
        const db = await getRandomCollection();

        await db.create({ id: "id1", value: "1" });
        await db.create({ id: "id2", value: "2" });

        const find = await db.find(undefined, undefined, { sortBy: "value", sortOrder: "desc" });
        expect(find).toHaveLength(2);

        expect(find[0].id).toBe("id2");
        expect(find[1].id).toBe("id1");
    });

    test("should query with paging and sorting ascending", async () => {
        const db = await getRandomCollection();

        await db.create({ id: "id1", value: "1" });
        await db.create({ id: "id2", value: "2" });

        const find1 = await db.find(undefined, { skip: 0, limit: 1 }, { sortBy: "value", sortOrder: "asc" });
        expect(find1).toHaveLength(1);
        expect(find1[0].id).toBe("id1");

        const find2 = await db.find(undefined, { skip: 1, limit: 1 }, { sortBy: "value", sortOrder: "asc" });
        expect(find2).toHaveLength(1);
        expect(find2[0].id).toBe("id2");
    });

    test("should query with paging and sorting descending", async () => {
        const db = await getRandomCollection();

        await db.create({ id: "id1", value: "1" });
        await db.create({ id: "id2", value: "2" });

        const find1 = await db.find(undefined, { skip: 0, limit: 1 }, { sortBy: "value", sortOrder: "desc" });
        expect(find1).toHaveLength(1);
        expect(find1[0].id).toBe("id2");

        const find2 = await db.find(undefined, { skip: 1, limit: 1 }, { sortBy: "value", sortOrder: "desc" });
        expect(find2).toHaveLength(1);
        expect(find2[0].id).toBe("id1");
    });

    test("should not allow to create duplicate entries for unique index", async function () {
        const db = await getRandomCollection(["id"]);

        await db.create({ id: "uniqueValue" });

        await expect(db.create({ id: "uniqueValue" })).rejects.toThrow(/[Dd]uplicate key/);
    });

    describe("patch vs update", () => {
        test("update is not working properly", async () => {
            const db = await getRandomCollection();

            const entry = { id: "test", name: "test" };
            const createdEntry = await db.create(entry);

            // this will completely replaced
            await db.update(createdEntry, { id: "test", name: "updated" });

            // this will not replace the above b/c it's not even found
            await expect(
                db.update(createdEntry, { id: "test", name: "test", anotherField: "newField" })
            ).rejects.toThrow("Document not found for updating");

            const queriedEntry = await db.findOne({ id: "test" });
            expect(queriedEntry.name).toBe("updated");
            expect(queriedEntry.anotherField).toBeUndefined();
        });

        test("patch is better", async () => {
            const db = await getRandomCollection();

            const entry = { id: "test", name: "test" };
            const createdEntry = await db.create(entry);

            // this changes name
            await db.patch(createdEntry, { id: "test", name: "updated" });

            // this only adds another field
            await db.patch(createdEntry, { id: "test", name: "test", anotherField: "newField" });

            const queriedEntry = await db.findOne({ id: "test" });
            expect(queriedEntry.name).toBe("updated");
            expect(queriedEntry.anotherField).toBe("newField");
        });
    });
});
