import { describe, expect, test } from "@jest/globals";
import qs from "qs";
import querystring from "querystring";
import { QueryTranslator } from "../src";

describe("parseStringVal()", () => {
    const dbqsWithParsing = new QueryTranslator({
        keyRegex: /^[a-zæøå0-9-_.]+$/i
    });
    const dbqsWithoutParsing = new QueryTranslator({
        keyRegex: /^[a-zæøå0-9-_.]+$/i,
        string: { toNumber: false, toBoolean: false }
    });

    describe("true", () => {
        ["true", "TrUe", "TRUE"].forEach((val) => {
            test(`returns true for "${val}" string`, () => {
                expect(dbqsWithParsing.parseStringVal(val)).toStrictEqual(true);
            });

            test(`returns "${val}" for "${val}" when !toBoolean`, () => {
                expect(dbqsWithoutParsing.parseStringVal(val)).toStrictEqual(val);
            });
        });
    });

    describe("false", () => {
        ["false", "FaLsE", "FALSE"].forEach((val) => {
            test(`returns false for "${val}" string`, () => {
                expect(dbqsWithParsing.parseStringVal(val)).toStrictEqual(false);
            });

            test(`returns "${val}" for "${val}" when !toBoolean`, () => {
                expect(dbqsWithoutParsing.parseStringVal(val)).toStrictEqual(val);
            });
        });
    });

    describe("integers", () => {
        [
            "0",
            "1",
            "100",
            "000100",
            "+0",
            "+1",
            "+100",
            "+000100",
            "-0",
            "-1",
            "-100",
            "-000100",
            " 0 ",
            " 1 ",
            " 100 ",
            " 000100 "
        ].forEach((val) => {
            const ret = parseInt(val, 10);

            test(`returns ${ret} for "${val}"`, () => {
                expect(dbqsWithParsing.parseStringVal(val)).toStrictEqual(ret);
                expect(dbqsWithParsing.parseStringVal(val)).not.toStrictEqual(NaN);
            });

            test(`returns "${val}" for "${val}" when !toNumber`, () => {
                expect(dbqsWithoutParsing.parseStringVal(val)).toStrictEqual(val);
            });
        });
    });

    describe("floats", () => {
        [
            "0.0",
            "1.1",
            "100.99",
            "000100.0099",

            "+0.0",
            "+1.1",
            "+100.99",
            "+000100.0099",

            "-0.0",
            "-1.1",
            "-100.99",
            "-000100.0099",

            " 0.0 ",
            " 1.1 ",
            " 100.99 ",
            " 000100.0099 "
        ].forEach((val) => {
            const ret = parseFloat(val);

            test(`returns ${ret} for "${val}"`, () => {
                expect(dbqsWithParsing.parseStringVal(val)).toStrictEqual(parseFloat(val));
                expect(dbqsWithParsing.parseStringVal(val)).not.toStrictEqual(NaN);
            });

            test(`returns "${val}" for "${val}" when !toNumber`, () => {
                expect(dbqsWithoutParsing.parseStringVal(val)).toStrictEqual(val);
            });
        });
    });

    describe("strings", () => {
        [
            "",
            " ",
            "  ",
            "    ",
            "+",
            "-",
            " + ",
            " - ",
            "a",
            "ab",
            "abc",
            " a ",
            " ab ",
            " abc ",
            "abc123abc",
            "abc123",
            "123abc",
            "123abc123"
        ].forEach((val) => {
            test(`returns "${val}" for "${val}"`, () => {
                expect(dbqsWithParsing.parseStringVal(val)).toStrictEqual(val);
            });
        });
    });
});

describe("parseString()", () => {
    const dbqs = new QueryTranslator({
        keyRegex: /^[a-zæøå0-9-_.]+$/i
    });
    test('returns $nin for "!" operator when array is true', () => {
        expect(dbqs.parseString("!10", true)).toStrictEqual({
            field: "$nin",
            op: "!",
            org: "10",
            parsed: { $nin: 10 },
            value: 10
        });
    });

    test('returns $in for "" operator when array is true', () => {
        expect(dbqs.parseString("10", true)).toStrictEqual({
            field: "$in",
            op: "",
            org: "10",
            parsed: { $in: 10 },
            value: 10
        });
    });

    test('returns $exists false for "!" operator when value is ""', () => {
        expect(dbqs.parseString("!")).toStrictEqual({
            field: "$exists",
            op: "!",
            org: "",
            parsed: { $exists: false },
            value: false
        });
    });

    test('returns $exists true for "" operator when value is ""', () => {
        expect(dbqs.parseString("")).toStrictEqual({
            field: "$exists",
            op: "",
            org: "",
            parsed: { $exists: true },
            value: true
        });
    });

    test('returns $ne for "!" operator', () => {
        expect(dbqs.parseString("!10")).toStrictEqual({
            field: "$ne",
            op: "!",
            org: "10",
            parsed: { $ne: 10 },
            value: 10
        });
    });

    test('returns $eq for "" operator', () => {
        expect(dbqs.parseString("10")).toStrictEqual({
            field: "$eq",
            op: "",
            org: "10",
            parsed: { $eq: 10 },
            value: 10
        });
    });

    test('returns $gt for ">" operator', () => {
        expect(dbqs.parseString(">10")).toStrictEqual({
            field: "$gt",
            op: ">",
            org: "10",
            parsed: { $gt: 10 },
            value: 10
        });
    });

    test('returns $gte for ">=" operator', () => {
        expect(dbqs.parseString(">=10")).toStrictEqual({
            field: "$gte",
            op: ">",
            org: "10",
            parsed: { $gte: 10 },
            value: 10
        });
    });

    test('returns $lt for "<" operator', () => {
        expect(dbqs.parseString("<10")).toStrictEqual({
            field: "$lt",
            op: "<",
            org: "10",
            parsed: { $lt: 10 },
            value: 10
        });
    });

    test('returns $lte for "<=" operator', () => {
        expect(dbqs.parseString("<=10")).toStrictEqual({
            field: "$lte",
            op: "<",
            org: "10",
            parsed: { $lte: 10 },
            value: 10
        });
    });

    test('returns $regex for "^" operator', () => {
        expect(dbqs.parseString("^10")).toStrictEqual({
            field: "$regex",
            op: "^",
            options: "i",
            org: "10",
            parsed: { $options: "i", $regex: "^10" },
            value: "^10"
        });
    });

    test('returns $regex for "$" operator', () => {
        expect(dbqs.parseString("$10")).toStrictEqual({
            field: "$regex",
            op: "$",
            options: "i",
            org: "10",
            parsed: { $options: "i", $regex: "10$" },
            value: "10$"
        });
    });

    test('returns $regex for "~" operator', () => {
        expect(dbqs.parseString("~10")).toStrictEqual({
            field: "$regex",
            op: "~",
            options: "i",
            org: "10",
            parsed: { $options: "i", $regex: "10" },
            value: "10"
        });
    });
});

describe("parse()", () => {
    const dbqs = new QueryTranslator({
        keyRegex: /^[a-zæøå0-9-_.]+$/i
    });
    describe("parsing", () => {
        describe("key value validation", () => {
            test("accepts keys with alpha num names", () => {
                expect(
                    dbqs.parse({
                        "Abc.Æøå_123-456": "bix" // eslint-disable-line @typescript-eslint/naming-convention
                    })
                ).toStrictEqual({
                    "Abc.Æøå_123-456": "bix" // eslint-disable-line @typescript-eslint/naming-convention
                });
            });

            test("discards keys with special chars", () => {
                expect(
                    dbqs.parse({
                        h4xor$: "bix"
                    })
                ).toStrictEqual({});
            });

            test("discards non-string values", () => {
                expect(
                    dbqs.parse({
                        foo: []
                    })
                ).toStrictEqual({});
                expect(
                    dbqs.parse({
                        foo: {}
                    })
                ).toStrictEqual({});
                expect(
                    dbqs.parse({
                        foo: false
                    })
                ).toStrictEqual({});
            });
        });

        describe("no operator", () => {
            test("returns empty query set", () => {
                expect(dbqs.parse({})).toStrictEqual({});
            });

            test("returns equal query", () => {
                expect(
                    dbqs.parse({
                        navn: "foo"
                    })
                ).toStrictEqual({
                    navn: "foo"
                });
            });

            test("return string boolean as boolean", () => {
                expect(
                    dbqs.parse({
                        foo: "true",
                        bar: "false"
                    })
                ).toStrictEqual({
                    foo: true,
                    bar: false
                });
            });

            test("returns string integer as number", () => {
                expect(
                    dbqs.parse({
                        navn: "10"
                    })
                ).toStrictEqual({
                    navn: 10
                });
            });

            test("returns string float as number", () => {
                expect(
                    dbqs.parse({
                        navn: "10.110"
                    })
                ).toStrictEqual({
                    navn: 10.11
                });
            });

            test("returns exists for empty query", () => {
                expect(
                    dbqs.parse({
                        navn: ""
                    })
                ).toStrictEqual({
                    navn: {
                        $exists: true
                    }
                });
            });
        });

        describe("! operator", () => {
            test("returns unequal query", () => {
                expect(
                    dbqs.parse({
                        navn: "!foo"
                    })
                ).toStrictEqual({
                    navn: {
                        $ne: "foo"
                    }
                });
            });

            test("return string boolean as boolean", () => {
                expect(
                    dbqs.parse({
                        foo: "!true",
                        bar: "!false"
                    })
                ).toStrictEqual({
                    foo: { $ne: true },
                    bar: { $ne: false }
                });
            });

            test("returns string integer as number", () => {
                expect(
                    dbqs.parse({
                        navn: "!10"
                    })
                ).toStrictEqual({
                    navn: {
                        $ne: 10
                    }
                });
            });

            test("returns string float as number", () => {
                expect(
                    dbqs.parse({
                        navn: "!10.110"
                    })
                ).toStrictEqual({
                    navn: {
                        $ne: 10.11
                    }
                });
            });

            test("returns not exists for empty query", () => {
                expect(
                    dbqs.parse({
                        navn: "!"
                    })
                ).toStrictEqual({
                    navn: {
                        $exists: false
                    }
                });
            });
        });

        describe("> operator", () => {
            test("returns greater than query", () => {
                expect(
                    dbqs.parse({
                        navn: ">10.110"
                    })
                ).toStrictEqual({
                    navn: {
                        $gt: 10.11
                    }
                });
            });
        });

        describe(">= operator", () => {
            test("returns greater than or equal to query", () => {
                expect(
                    dbqs.parse({
                        navn: ">=10.110"
                    })
                ).toStrictEqual({
                    navn: {
                        $gte: 10.11
                    }
                });
            });
        });

        describe("< operator", () => {
            test("returns less than query", () => {
                expect(
                    dbqs.parse({
                        navn: "<10.110"
                    })
                ).toStrictEqual({
                    navn: {
                        $lt: 10.11
                    }
                });
            });
        });

        describe("<= operator", () => {
            test("returns less than query or equal to", () => {
                expect(
                    dbqs.parse({
                        navn: "<=10.110"
                    })
                ).toStrictEqual({
                    navn: {
                        $lte: 10.11
                    }
                });
            });
        });

        describe("multiple <, <=, >, >= operators", () => {
            test("returns multiple comparison operators for same field", () => {
                expect(
                    dbqs.parse({
                        count: [">0.123", ">=1.234", "<2.345", "<=3.456"]
                    })
                ).toStrictEqual({
                    count: {
                        $gt: 0.123,
                        $gte: 1.234,
                        $lt: 2.345,
                        $lte: 3.456
                    }
                });
            });
        });

        describe("^ operator", () => {
            test("returns starts with query", () => {
                expect(
                    dbqs.parse({
                        navn: "^foo"
                    })
                ).toStrictEqual({
                    navn: {
                        $regex: "^foo",
                        $options: "i"
                    }
                });
            });
        });

        describe("$ operator", () => {
            test("returns ends with query", () => {
                expect(
                    dbqs.parse({
                        navn: "$foo"
                    })
                ).toStrictEqual({
                    navn: {
                        $regex: "foo$",
                        $options: "i"
                    }
                });
            });
        });

        describe("~ operator", () => {
            test("returns contains query", () => {
                expect(
                    dbqs.parse({
                        navn: "~foo"
                    })
                ).toStrictEqual({
                    navn: {
                        $regex: "foo",
                        $options: "i"
                    }
                });
            });
        });

        describe("$in / $nin operator", () => {
            test("returns in array query", () => {
                const string = "foo[]=10&foo[]=10.011&foo[]=bar&foo[]=true";
                const params = querystring.parse(string);

                expect(dbqs.parse(params)).toStrictEqual({
                    foo: {
                        $in: [10, 10.011, "bar", true]
                    }
                });
            });

            test('returns in array query with "qs" parser (GH-06)', () => {
                const string = "foo[]=10&foo[]=10.011&foo[]=bar&foo[]=true";
                const params = qs.parse(string);

                expect(dbqs.parse(params)).toStrictEqual({
                    foo: {
                        $in: [10, 10.011, "bar", true]
                    }
                });
            });

            test("returns in array with any not in array query", () => {
                const string = "foo[]=10&foo[]=!10.011&foo[]=!bar&foo[]=baz";
                const params = querystring.parse(string);

                expect(dbqs.parse(params)).toStrictEqual({
                    foo: {
                        $in: [10, "baz"],
                        $nin: [10.011, "bar"]
                    }
                });
            });

            test("returns not in array query", () => {
                const string = "foo[]=!10&foo[]=!10.011&foo[]=!bar&foo[]=!false";
                const params = querystring.parse(string);

                expect(dbqs.parse(params)).toStrictEqual({
                    foo: {
                        $nin: [10, 10.011, "bar", false]
                    }
                });
            });

            test('returns not in array query with "gs" parser (GH-06)', () => {
                const string = "foo[]=!10&foo[]=!10.011&foo[]=!bar&foo[]=!false";
                const params = qs.parse(string);

                expect(dbqs.parse(params)).toStrictEqual({
                    foo: {
                        $nin: [10, 10.011, "bar", false]
                    }
                });
            });

            test("returns not in array with any in array query", () => {
                const string = "foo[]=!10&foo[]=10.011&foo[]=bar&foo[]=!baz";
                const params = querystring.parse(string);

                expect(dbqs.parse(params)).toStrictEqual({
                    foo: {
                        $nin: [10, "baz"],
                        $in: [10.011, "bar"]
                    }
                });
            });
        });

        test("returns multiple querys", () => {
            const string = ["foo=", "bar=!", "baz=!foo", "bix=bez", "%foo=bar", "bix.bax=that", "foo-bar=bar-foo"].join(
                "&&"
            );
            const params = querystring.parse(string);

            expect(dbqs.parse(params)).toStrictEqual({
                foo: { $exists: true },
                bar: { $exists: false },
                baz: { $ne: "foo" },
                bix: "bez",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "bix.bax": "that",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "foo-bar": "bar-foo"
            });
        });
    });

    describe("aliasing", () => {
        test("returns query for aliased key", () => {
            const dbqs = new QueryTranslator({
                alias: {
                    foo: "bar"
                }
            });

            expect(
                dbqs.parse({
                    foo: "bix"
                })
            ).toStrictEqual({
                bar: "bix"
            });
        });

        test("returns multiple queries for aliased keys", () => {
            const dbqs = new QueryTranslator({
                alias: {
                    foo: "bar",
                    baz: "bax"
                }
            });

            expect(
                dbqs.parse({
                    foo: "bix",
                    baz: "box"
                })
            ).toStrictEqual({
                bar: "bix",
                bax: "box"
            });
        });
    });

    describe("blacklisting", () => {
        test("does not return query for blacklisted key", () => {
            const dbqs = new QueryTranslator({
                blacklist: {
                    foo: true
                }
            });

            expect(
                dbqs.parse({
                    foo: "bar",
                    bar: "foo"
                })
            ).toStrictEqual({
                bar: "foo"
            });
        });

        test("does not return multiple query for blacklisted keys", () => {
            const dbqs = new QueryTranslator({
                blacklist: {
                    foo: true,
                    bar: true
                }
            });

            expect(
                dbqs.parse({
                    foo: "bar",
                    bar: "foo",
                    baz: "bax"
                })
            ).toStrictEqual({
                baz: "bax"
            });
        });
    });

    describe("whitelisting", () => {
        test("returns query only for whitelisted key", () => {
            const dbqs = new QueryTranslator({
                whitelist: {
                    foo: true
                }
            });

            expect(
                dbqs.parse({
                    foo: "bar",
                    bar: "foo",
                    baz: "bax"
                })
            ).toStrictEqual({
                foo: "bar"
            });
        });

        test("returns multiple queries for whitelisted keys", () => {
            const dbqs = new QueryTranslator({
                whitelist: {
                    foo: true,
                    bar: true
                }
            });

            expect(
                dbqs.parse({
                    foo: "bar",
                    bar: "foo",
                    baz: "bax"
                })
            ).toStrictEqual({
                foo: "bar",
                bar: "foo"
            });
        });
    });
});
