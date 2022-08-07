# Zoq [![GitHub Actions](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fminodisk%2Fzoq%2Fbadge%3Fref%3Dmain&style=flat-square)](https://actions-badge.atrox.dev/minodisk/zoq/goto?ref=main) [![NPM](https://img.shields.io/npm/v/zoq?style=flat-square)](https://www.npmjs.com/package/zoq) [![Codecov](https://img.shields.io/codecov/c/github/minodisk/zoq?style=flat-square)](https://app.codecov.io/gh/minodisk/zoq/)

Convert [Zod](https://github.com/colinhacks/zod) to [BigQuery Schema](https://cloud.google.com/bigquery/docs/schemas).

## Installation

```bash
npm install -S zoq
```

## Usage

```TypeScript
import { BigQuery } from "@google-cloud/bigquery";
import { z } from "zod";
import { convert, RegExpDate, RegExpTime } from "zoq";

async function createTable() {
  const definition = z.object({
    bool: z.boolean().nullable(),
    numeric: z.number().nullable(),
    int64: z.number().int().nullable(),
    bigint: z.bigint().nullable(),
    string: z.string().nullable(),
    timestamp: z.date().nullable(),
    date: z.string().regex(RegExpDate).nullable(),
    time: z.string().regex(RegExpTime).nullable(),
  });
  const schema = convert(definition);

  console.log(schema);
  // outputs -> [
  //   { name: "bool", type: "BOOL", mode: "NULLABLE" },
  //   { name: "numeric", type: "NUMERIC", mode: "NULLABLE" },
  //   { name: "int64", type: "INT64", mode: "NULLABLE" },
  //   { name: "bigint", type: "BIGNUMERIC", mode: "NULLABLE" },
  //   { name: "string", type: "STRING", mode: "NULLABLE" },
  //   { name: "timestamp", type: "TIMESTAMP", mode: "NULLABLE" },
  //   { name: "date", type: "DATE", mode: "NULLABLE" },
  //   { name: "time", type: "TIME", mode: "NULLABLE" },
  // ];

  await new BigQuery()
    .dataset("dataset_id")
    .createTable("table_id", { schema });
}
```
