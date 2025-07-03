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

    test("$contains with addtional properties throws", () => {
        expect(() =>
            removeContainsInQuery({
                aKey: {
                    $contains: "a-string",
                    $eq: "a-string"
                }
            })
        ).toThrow("Unsupported query: an object with $contains must not have additional properties");
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

        expect(
            removeContainsInQuery({
                $or: [
                    {
                        key1: {
                            $containsAny: ["string-1", "string-2"]
                        }
                    },
                    {
                        key2: {
                            $containsAny: ["string-1", "string-2"]
                        }
                    }
                ]
            })
        ).toStrictEqual({
            $or: [
                {
                    key1: {
                        $in: ["string-1", "string-2"]
                    }
                },
                {
                    key2: {
                        $in: ["string-1", "string-2"]
                    }
                }
            ]
        });

        expect(
            removeContainsInQuery({
                anotherProp: "propValue",
                status: { $containsAny: ["A", "B"] }
            })
        ).toStrictEqual({
            anotherProp: "propValue",
            status: { $in: ["A", "B"] }
        });

        expect(
            removeContainsInQuery({
                status: { $containsNone: ["A", "B"], $containsAny: ["C", "D"] }
            })
        ).toStrictEqual({
            status: { $nin: ["A", "B"], $in: ["C", "D"] }
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
