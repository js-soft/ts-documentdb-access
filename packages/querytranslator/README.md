# Database QueryTranslator

[![npm version](https://badge.fury.io/js/@js-soft%2fdocdb-querytranslator.svg)](https://www.npmjs.com/package/@js-soft/docdb-querytranslator)

Translates URI query parameters to MongoDB and LokiJS compatible queries. This is useful for building user specified queries.

## Features

-   Aliased query parameters
-   Blacklisted query parameters
-   Whitelisted query parameters
-   Basic operators
    -   `$eq`
    -   `$gt`
    -   `$gte`
    -   `$lt`
    -   `$lte`
    -   `$ne`
    -   `$in`
    -   `$nin`
    -   `$exists`
    -   `$regex`
-   Parse string integers and floats to numbers
-   Parse string boolean to ture/false booleans

| operation                | query string             | query object                                |
| ------------------------ | ------------------------ | ------------------------------------------- |
| equal                    | `?foo=bar`               | `{ foo: "bar" }`                            |
| unequal                  | `?foo=!bar`              | `{ foo: { $ne: "bar" }}`                    |
| exists                   | `?foo=`                  | `{ foo: { $exists: true }}`                 |
| not exists               | `?foo=!`                 | `{ foo: { $exists: false }}`                |
| greater than             | `?foo=>10`               | `{ foo: { $gt: 10 }}`                       |
| less than                | `?foo=<10`               | `{ foo: { $lt: 10 }}`                       |
| greater than or equal to | `?foo=>=10`              | `{ foo: { $gte: 10 }}`                      |
| less than or equal to    | `?foo=<=10`              | `{ foo: { $lte: 10 }}`                      |
| starts with              | `?foo=^bar`              | `{ foo: { $regex: "^bar", $options: "i" }}` |
| ends with                | `?foo=$bar`              | `{ foo: { $regex: "bar$", $options: "i" }}` |
| contains                 | `?foo=~bar`              | `{ foo: { $regex: "bar", $options: "i" }}`  |
| in array                 | `?foo[]=bar&foo[]=baz`   | `{ foo: { $in: ['bar', 'baz'] }}`           |
| not in array             | `?foo[]=!bar&foo[]=!baz` | `{ foo: { $nin: ['bar', 'baz'] }}`          |

-   Geospatial operators
    -   `$geoWithin` (polygon)
    -   `$near` (point)

| operation                 | query string    | query object                                        |
| ------------------------- | --------------- | --------------------------------------------------- |
| bbox                      | `?bbox=0,1,2,3` | `{ geojson: { $geoWithin: { $geometry: { … } } } }` |
| near                      | `?near=0,1`     | `{ geojson: { $near: { $geometry: { … } } } }`      |
| near (max distance)       | `?near=0,1,2`   | `{ geojson: { $near: { …, $maxDistance: 2 } } }`    |
| near (max & min distance) | `?near=0,1,2,3` | `{ geojson: { $near: { …, $minDistance: 3 } } }`    |

## Install

```
npm install @js-soft/docdb-querytranslator --save
```

## API

```javascript
var QueryTranslator = require("@js-soft/docdb-querytranslator").QueryTranslator;

import { QueryTranslator } from "@js-soft/docdb-querytranslator";
```

### new QueryTranslator(`object` options)

-   `Array` ops - list of supported operators (default: `['!', '^', '$', '~', '>', '<', '$in']`)
-   `object` alias - query param aliases (default: `{}`)
-   `object` blacklist - blacklisted query params (default: `{}`)
-   `object` whitelist - whitelisted query params (default: `{}`)
-   `object` custom - custom query params (default: `{}`)
-   `object` string - string parsing
    -   `boolean` toBoolean - parse `"true"`, `"false"` string to booleans (default: `true`)
    -   `boolean` toNumber - parse string integer and float values to numbers (default: `true`)
-   `regexp` keyRegex - allowed key names (default: `/^[A-z_@][A-z@0-9-_]*(\.[A-z_@][A-z@0-9-_]*)*$/`)
-   `regexp` arrRegex - allowed array key names (default: `/^[a-zæøå0-9-_.]+(\[\])?$/i`)

#### Define custom queries

Custom queries are on the folling form; you define the URL query parameter name
that your users will be using and a function which takes the result query object
and the value for query parameter.

```javascript
var qt = new QueryTranslator({
    custom: {
        urlQueryParamName: function (query, input) {
            // do some processing of input value
            // add your queries to the query object
            query["someField"] = input;
            query["someOtherFiled"] = "some value";
        }
    }
});
```

If you want to use custom queries make sure that you make queries that are compatible with the [MongoDB](https://docs.mongodb.com/manual/tutorial/query-documents/) and/or [LokiJS](https://github.com/techfort/LokiJS/wiki/Query-Examples) query syntax, depending on what database you want to run it on.

View [the compatibility overview](#compatibility) for more information.

### qs.parse(`object` params)

Params is an object with URI query params and their values. Ex. `req.params`
if you are working with ExpressJS.

```javascript
var query = qs.parse(req.params);

mongo
    .collection("mycol")
    .find(query, field)
    .toArray(function (err, documents) {
        // matching documents
    });
```

## Compatibility of MongoDb and LokiJs queries

### compatibility

|    Operator    | MongoDb | LokiJs |
| :------------: | :-----: | :----: |
|      $eq       |    X    |   X    |
|      $gt       |    X    |   X    |
|      $gte      |    X    |   X    |
|      $in       |    X    |   X    |
|      $lt       |    X    |   X    |
|      $lte      |    X    |   X    |
|      $ne       |    X    |   X    |
|      $nin      |    X    |   X    |
|      $and      |    X    |   X    |
|      $not      |    X    |        |
|      $nor      |    X    |        |
|      $or       |    X    |   X    |
|    $exists     |    X    |   X    |
|     $type      |    X    |   X    |
|     $expr      |    X    |        |
|  $jsonSchema   |    X    |        |
|      $mod      |    X    |        |
|     $regex     |    X    |   X    |
|     $text      |    X    |        |
|     $where     |    X    |        |
| $geoIntersects |    X    |        |
|   $geoWithin   |    X    |        |
|     $near      |    X    |        |
|     $nearS     |    X    |        |
|      $all      |    X    |        |
|   $elemMatch   |    X    |        |
|     $size      |    X    |   X    |
| $bitsAllClear  |    X    |        |
|  $bitsAllSet   |    X    |        |
| $bitsAnyClear  |    X    |        |
|  $bitsAnySet   |    X    |        |
|      $aeq      |         |   X    |
|     $dteq      |         |   X    |
|    $between    |         |   X    |
|     $jgte      |         |   X    |
|      $jlt      |         |   X    |
|     $jlte      |         |   X    |
|   $jbetween    |         |   X    |
|     $keyin     |         |   X    |
|    $nkeyin     |         |   X    |
|   $definedin   |         |   X    |
|  $undefinedin  |         |   X    |
|   $contains    |         |   X    |
|  $containsAny  |         |   X    |
| $containsNone  |         |   X    |
|    $finite     |         |   X    |
|      $len      |         |   X    |

### known incompatibilities

-   matching objects in an array (e.g. `{ "an-array": ["a-string"] }` requires `{"an-array": "a-string"}` for MongoDB and `{"an-array": {"$contains": "a-string"}}` for LokiJS)

    The mongodb parser therefore will accept `$contains` and rewrite `{"an-array": {"$contains": "a-string"}}` to `{"an-array": "a-string"}`

### LokiJs Operators

-   `$eq` - filter for document(s) with property of (strict) equality
-   `$ne` - filter for document(s) with property not equal to provided value
-   `$aeq` - filter for document(s) with property of abstract (loose) equality
-   `$dteq` - filter for document(s) with date property equal to provided date value
-   `$gt` - filter for document(s) with property greater than provided value
-   `$gte` - filter for document(s) with property greater or equal to provided value
-   `$lt` - filter for document(s) with property less than provided value
-   `$lte` - filter for document(s) with property less than or equal to provided value
-   `$between` - filter for documents(s) with property between provided vals
-   `$jgte` - filter (using simplified javascript comparison) for docs with property greater than or equal to provided value
-   `$jlt` - filter (using simplified javascript comparison) for docs with property less than provided value
-   `$jlte` - filter (using simplified javascript comparison) for docs with property less than or equal to provided value
-   `$jbetween` - filter (using simplified javascript comparison) for docs with property between provided vals
-   `$regex` - filter for document(s) with property matching provided regular expression
-   `$in` - filter for document(s) with property matching any of the provided array values. Your property should not be an array but your compare values should be.
-   `$nin` - filter for document(s) with property not matching any of the provided array values.
-   `$keyin` - filter for document(s) whose property value is defined in the provided hash object keys. (Equivalent to $in: Object.keys(hashObject)) ( #362, #365 )
-   `$nkeyin` - filter for document(s) whose property value is not defined in the provided hash object keys. (Equivalent to $nin: Object.keys(hashObject)) ( #362, #365 )
-   `$definedin` - filter for document(s) whose property value is defined in the provided hash object as a value other than undefined. #285
-   `$undefinedin` - filter for document(s) whose property value is not defined in the provided hash object or defined but is undefined. #285
-   `$contains` - filter for document(s) with property containing the provided value. ( commit, #205 ). Use this when your property contains an array but your compare value is not an array.
-   `$containsAny` - filter for document(s) with property containing any of the provided values. Use this when your property contains an array -and- your compare value is an array.
-   `$containsNone` - filter for documents(s) with property containing none of the provided values
-   `$type` - filter for documents which have a property of a specified type
-   `$finite` - filter for documents with property which is numeric or non-numeric.
-   `$size` - filter for documents which have array property of specified size. (does not work for strings)
-   `$len` - filter for documents which have string property of specified length.
-   `$and` - filter for documents which meet all nested subexpressions
-   `$or` - filter for documents which meet any of the nested subexpressions
-   `$exists` - filter for documents which contain (even when the value is null) this field or not

### MongoDb Operators

#### Query

-   `$eq` Matches values that are equal to a specified value.
-   `$gt` Matches values that are greater than a specified value.
-   `$gte` Matches values that are greater than or equal to a specified value.
-   `$in` Matches any of the values specified in an array.
-   `$lt` Matches values that are less than a specified value.
-   `$lte` Matches values that are less than or equal to a specified value.
-   `$ne` Matches all values that are not equal to a specified value.
-   `$nin` Matches none of the values specified in an array.

#### Logical

-   `$and` Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
-   `$not` Inverts the effect of a query expression and returns documents that do not match the query expression.
-   `$nor` Joins query clauses with a logical NOR returns all documents that fail to match both clauses.
-   `$or` Joins query clauses with a logical OR returns all documents that match the conditions of either clause.

#### Element

-   `$exists` Matches documents that have the specified field.
-   `$type` Selects documents if a field is of the specified type.

#### Evaluation

-   `$expr` Allows use of aggregation expressions within the query language.
-   `$jsonSchema` Validate documents against the given JSON Schema.
-   `$mod` Performs a modulo operation on the value of a field and selects documents with a specified result.
-   `$regex` Selects documents where values match a specified regular expression.
-   `$text` Performs text search.
-   `$where` Matches documents that satisfy a JavaScript expression.

#### Geospatial

-   `$geoIntersects` Selects geometries that intersect with a GeoJSON geometry. The 2dsphere index supports $geoIntersects.
-   `$geoWithin` Selects geometries within a bounding GeoJSON geometry. The 2dsphere and 2d indexes support $geoWithin.
-   `$near` Returns geospatial objects in proximity to a point. Requires a geospatial index. The 2dsphere and 2d indexes support $near.
-   `$nearS` Returns geospatial objects in proximity to a point on a sphere. Requires a geospatial index. The 2dsphere and 2d indexes support $nearSphere.

#### Array

-   `$all` Matches arrays that contain all elements specified in the query.
-   `$elemMatch` Selects documents if element in the array field matches all the specified $elemMatch conditions.
-   `$size` Selects documents if the array field is a specified size.

#### Bitwise

-   `$bitsAllClear` Matches numeric or binary values in which a set of bit positions all have a value of 0.
-   `$bitsAllSet` Matches numeric or binary values in which a set of bit positions all have a value of 1.
-   `$bitsAnyClear` Matches numeric or binary values in which any bit from a set of bit positions has a value of 0.
-   `$bitsAnySet` Matches numeric or binary values in which any bit from a set of bit positions has a value of 1.

## Credits

This project was inspired by the [Turistforeningen/node-mongo-querystring](https://github.com/Turistforeningen/node-mongo-querystring) library.

## License

[MIT](LICENSE)
