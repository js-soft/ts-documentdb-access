export function removeContainsInQuery(query?: any): any {
    if (query === undefined) {
        return undefined;
    }

    for (const key of Object.keys(query)) {
        const value = query[key];

        const valueIsObject = typeof value === "object";

        if (!valueIsObject && key === "$contains") {
            return value;
        }

        if (key === "$containsAny") {
            return { $in: value };
        }

        if (key === "$containsNone") {
            return { $nin: value };
        }

        if (!valueIsObject) {
            return query;
        }

        query[key] = removeContainsInQuery(value);
    }

    return query;
}
