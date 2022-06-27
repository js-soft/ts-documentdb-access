import { describe, expect, test } from "@jest/globals";
import { removeContainsInQuery } from "../src/queryUtils";

describe("queryUtils", () => {
    test("should replace the correct keys", () => {
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

    test("should accept undefined", () => {
        expect(removeContainsInQuery(undefined)).toStrictEqual(undefined);
    });
});
