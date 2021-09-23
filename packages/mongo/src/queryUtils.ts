export function removeContainsInQuery(query?: any): any {
    if (query === undefined) {
        return undefined;
    }

    for (const key of Object.keys(query)) {
        const value = query[key];

        const valueIsObject = typeof value === "object";
        const keyIsContains = key === "$contains";

        if (!valueIsObject && keyIsContains) {
            return value;
        }

        if (!valueIsObject) {
            return query;
        }

        query[key] = removeContainsInQuery(value);
    }

    return query;
}
