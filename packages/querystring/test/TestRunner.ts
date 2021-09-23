import { IDatabaseCollection, IDatabaseCollectionProvider } from "@nmshd/db-abstractions";
import qs from "qs";
import DbQueryString from "../src";

export class TestRunner {
    private collection: IDatabaseCollection;
    private readonly dbqs = new DbQueryString();
    private testObject: any;

    private async createTestObject() {
        this.testObject = {
            num: 5,
            negNum: -5,
            float: 5.1,
            string: "a-string",
            date: new Date().toISOString(),
            bool: true,
            array: ["a-value", "another-value"]
        };

        await this.collection.create(this.testObject);
    }

    private randomString() {
        return Math.random().toString(36).substring(7);
    }

    public async init(provider: IDatabaseCollectionProvider): Promise<void> {
        this.collection = await provider.getCollection(this.randomString());
        await this.createTestObject();
    }

    public run(): void {
        test("query all items", () => this.queryAll());
        test("exists", () => this.queryExists());

        test("num", () => this.queryNumberValues());
        test("negNum", () => this.queryNegativeNumberValues());
        test("float", () => this.queryFloatValues());
        test("string", () => this.queryStringValues());
        test("date", () => this.queryIsoDateValues());
        test("bool", () => this.queryBoolValues());
        test("or", () => this.queryOr());
        test("array", () => this.queryInArray());

        test("custom", () => this.testCustomQuery());
    }

    private async queryFromString(queryString: string, shouldContain: boolean, dbqs: DbQueryString = this.dbqs) {
        const qsParsed = qs.parse(queryString);
        const dbqsParsed = dbqs.parse(qsParsed);
        const result = await this.collection.find(dbqsParsed);

        if (shouldContain) {
            expect(result).toContainEqual(this.testObject);
        } else {
            expect(result).not.toContainEqual(this.testObject);
        }
    }

    private async queryAll() {
        await this.queryFromString("", true);
    }

    private async queryExists() {
        await this.queryFromString("num=", true);
        await this.queryFromString("num=!", false);

        await this.queryFromString("numm=!", true);
        await this.queryFromString("numm=", false);
    }

    private async queryNumberValues() {
        await this.queryFromString("num=5", true);
        await this.queryFromString("num=!5", false);
        await this.queryFromString("num=!6", true);

        await this.queryFromString("num=<6", true);
        await this.queryFromString("num=>4", true);

        await this.queryFromString("num=>6", false);
        await this.queryFromString("num=<4", false);

        await this.queryFromString("num=>=5", true);
        await this.queryFromString("num=>=4", true);
        await this.queryFromString("num=>=6", false);

        await this.queryFromString("num=<=5", true);
        await this.queryFromString("num=<=4", false);
        await this.queryFromString("num=<=6", true);
    }

    private async queryNegativeNumberValues() {
        await this.queryFromString("num=>-1", true);
        await this.queryFromString("num=<-1", false);

        await this.queryFromString("negNum=-5", true);
        await this.queryFromString("negNum=<-1", true);
        await this.queryFromString("negNum=<0", true);
        await this.queryFromString("negNum=>-6", true);
    }

    private async queryFloatValues() {
        await this.queryFromString("float=5.1", true);
        await this.queryFromString("float=!5.1", false);
        await this.queryFromString("float=!6.1", true);

        await this.queryFromString("float=<6.1", true);
        await this.queryFromString("float=>4.1", true);

        await this.queryFromString("float=>6.1", false);
        await this.queryFromString("float=<4.1", false);

        await this.queryFromString("float=>=4.1", true);
        await this.queryFromString("float=>=5.1", true);
        await this.queryFromString("float=>=6.1", false);

        await this.queryFromString("float=<=4.1", false);
        await this.queryFromString("float=<=5.1", true);
        await this.queryFromString("float=<=6.1", true);
    }

    private async queryStringValues() {
        await this.queryFromString("string=a-string", true);

        await this.queryFromString("string=^a-", true);
        await this.queryFromString("string=^b-", false);

        await this.queryFromString("string=$-string", true);
        await this.queryFromString("string=$-sting", false);
    }

    private async queryIsoDateValues() {
        await this.queryFromString(`date=${this.testObject.date}`, true);
        await this.queryFromString(`date=!${this.testObject.date}`, false);

        await this.queryFromString(`date=>${new Date(0).toISOString()}`, true);
        await this.queryFromString(`date=<${new Date().toISOString()}`, true);

        await this.queryFromString(`date=>${new Date().toISOString()}`, false);
        await this.queryFromString(`date=<${new Date(0).toISOString()}`, false);

        await this.queryFromString(`date=<=${this.testObject.date}`, true);
        await this.queryFromString(`date=<=${new Date(0).toISOString()}`, false);
        await this.queryFromString(`date=<=${new Date().toISOString()}`, true);

        await this.queryFromString(`date=>=${this.testObject.date}`, true);
        await this.queryFromString(`date=>=${new Date(0).toISOString()}`, true);
        await this.queryFromString(`date=>=${new Date().toISOString()}`, false);

        await this.queryFromString("date=>2021-00-00", true);
        await this.queryFromString("date=<2021-00-00", false);
        await this.queryFromString("date=>9999-00-00", false);
        await this.queryFromString("date=<9999-00-00", true);

        // Only passing a year is not working, because it is translated to number.
        // await this.queryFromString("date=>2021", true);
        // await this.queryFromString("date=<2021", false);
        // await this.queryFromString("date=>9999", false);
        // await this.queryFromString("date=<9999", true);

        // Timezones are not working, only ISO date-strings are supported (only string comparison)
        // await this.queryFromString(`date=<${this.testObject.date.replace("Z", "UTC")}`, false);
    }

    private async queryBoolValues() {
        await this.queryFromString("bool=true", true);
        await this.queryFromString("bool=false", false);

        await this.queryFromString("bool=!true", false);
        await this.queryFromString("bool=!false", true);
    }

    private async queryOr() {
        await this.queryFromString("string[]=a-string&string[]=another-string", true);
        await this.queryFromString("string[]=another-string&string[]=yet-another-string", false);
    }

    private async testCustomQuery() {
        const customDBQS = new DbQueryString({
            custom: {
                anyNum: (query, input) => {
                    const val = customDBQS.parseStringVal(input);
                    query["$or"] = [
                        {
                            num: val
                        },
                        {
                            negNum: val
                        }
                    ];
                },
                everyNum: (query, input) => {
                    const val = customDBQS.parseStringVal(input);
                    query["$and"] = [
                        {
                            num: val
                        },
                        {
                            negNum: val
                        }
                    ];
                }
            }
        });

        await this.queryFromString("", true, customDBQS);

        await this.queryFromString("anyNum=5", true, customDBQS);
        await this.queryFromString("everyNum=5", false, customDBQS);
    }

    private async queryInArray() {
        const query: any = {
            array: {
                $contains: "a-value"
            }
        };

        const result = await this.collection.find(query);
        expect(result).toContainEqual(this.testObject);
    }
}
