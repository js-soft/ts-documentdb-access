import { describe, expect, test } from "@jest/globals";
import { removeContainsInQuery } from "../src/queryUtils";

describe("queryUtils", () => {
    test("removes $contains", () => {
        expect(
            removeContainsInQuery({
                key: { $contains: "a-string" }
            })
        ).toStrictEqual({ key: "a-string" });

        expect(
            removeContainsInQuery({
                $and: {
                    key: { $contains: "a-string" },
                    key2: { $contains: "a-string" },
                    key3: { $eq: "a-string" }
                }
            })
        ).toStrictEqual({
            $and: {
                key: "a-string",
                key2: "a-string",
                key3: { $eq: "a-string" }
            }
        });
    });

    test("replaces $containsAny with $in", () => {
        expect(
            removeContainsInQuery({
                key: { $containsAny: "a-string" }
            })
        ).toStrictEqual({ key: { $in: "a-string" } });

        expect(
            removeContainsInQuery({
                $and: {
                    key: { $containsAny: "a-string" },
                    key2: { $containsAny: "a-string" },
                    key3: { $eq: "a-string" }
                }
            })
        ).toStrictEqual({
            $and: {
                key: { $in: "a-string" },
                key2: { $in: "a-string" },
                key3: { $eq: "a-string" }
            }
        });
    });

    test("replaces $containsNone with $nin", () => {
        expect(
            removeContainsInQuery({
                key: { $containsNone: "a-string" }
            })
        ).toStrictEqual({ key: { $nin: "a-string" } });

        expect(
            removeContainsInQuery({
                $and: {
                    key: { $containsNone: "a-string" },
                    key2: { $containsNone: "a-string" },
                    key3: { $eq: "a-string" }
                }
            })
        ).toStrictEqual({
            $and: {
                key: { $nin: "a-string" },
                key2: { $nin: "a-string" },
                key3: { $eq: "a-string" }
            }
        });
    });

    test("accepts undefined", () => {
        expect(removeContainsInQuery(undefined)).toStrictEqual(undefined);
    });
});
