export function removeContainsInQuery(query?: any): any {
    if (query === undefined) {
        return undefined;
    }

    if (typeof query !== "object") return query;

    for (const key of Object.keys(query)) {
        const value = query[key];

        const valueIsObject = typeof value === "object";

        if (!valueIsObject && key === "$contains") {
            if (Object.keys(query).length > 1) {
                throw new Error("Unsupported query: an object with $contains must not have additional properties");
            }

            return value;
        }

        if (key === "$containsAny") {
            query["$in"] = value;
            delete query["$containsAny"];
            continue;
        }

        if (key === "$containsNone") {
            query["$nin"] = value;
            delete query["$containsNone"];
            continue;
        }

        query[key] = removeContainsInQuery(value);
    }

    return query;
}
