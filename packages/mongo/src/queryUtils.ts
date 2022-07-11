export function removeContainsInQuery(query?: any): any {
    if (query === undefined) {
        return undefined;
    }

    for (const key of Object.keys(query)) {
        const value = query[key];

        const valueIsObject = typeof value === "object";

        if (valueIsObject) {
            query[key] = removeContainsInQuery(value);
            continue;
        }

        if (key === "$contains") {
            return value;
        }

        if (key === "$containsAny") {
            return { $in: value };
        }

        if (key === "$containsNone") {
            return { $nin: value };
        }

        return query;
    }

    return query;
}
