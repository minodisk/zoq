import { z } from "zod";
import { convert, RegExpDate, RegExpTime } from ".";

describe(`convert`, () => {
  it(`nullable`, () => {
    const fields = z.object({
      bool: z.boolean().nullable(),
      int64: z.number().int().nullable(),
      numeric: z.number().nullable(),
      bigint: z.bigint().nullable(),
      string: z.string().nullable(),
      timestamp: z.date().nullable(),
      date: z.string().regex(RegExpDate).nullable(),
      time: z.string().regex(RegExpTime).nullable(),
    });
    type Type = z.infer<typeof fields>;
    expect(convert(fields)).toStrictEqual([
      { name: "bool", type: "BOOL", mode: "NULLABLE" },
      { name: "int64", type: "INT64", mode: "NULLABLE" },
      { name: "numeric", type: "NUMERIC", mode: "NULLABLE" },
      { name: "bigint", type: "BIGNUMERIC", mode: "NULLABLE" },
      { name: "string", type: "STRING", mode: "NULLABLE" },
      { name: "timestamp", type: "TIMESTAMP", mode: "NULLABLE" },
      { name: "date", type: "DATE", mode: "NULLABLE" },
      { name: "time", type: "TIME", mode: "NULLABLE" },
    ]);
  });

  it(`convert struct`, () => {
    const fields = z.object({
      struct: z
        .object({
          bool: z.boolean(),
          int64: z.number().int(),
          numeric: z.number(),
          bigint: z.bigint(),
          string: z.string(),
          timestamp: z.date(),
          date: z.string().regex(RegExpDate),
          time: z.string().regex(RegExpTime),
        })
        .nullable(),
    });
    type Type = z.infer<typeof fields>;
    expect(convert(fields)).toStrictEqual([
      {
        name: "struct",
        mode: "NULLABLE",
        type: "STRUCT",
        fields: [
          { name: "bool", type: "BOOL" },
          { name: "int64", type: "INT64" },
          { name: "numeric", type: "NUMERIC" },
          { name: "bigint", type: "BIGNUMERIC" },
          { name: "string", type: "STRING" },
          { name: "timestamp", type: "TIMESTAMP" },
          { name: "date", type: "DATE" },
          { name: "time", type: "TIME" },
        ],
      },
    ]);
  });

  it(`convert array`, () => {
    const fields = z.object({
      repeated: z.array(z.boolean().nullable()).nullable(),
    });
    type Type = z.infer<typeof fields>;
    expect(convert(fields)).toStrictEqual([
      {
        name: "repeated",
        mode: "REPEATED",
        type: "BOOL",
      },
    ]);
  });

  it(`convert Array<Object>`, () => {
    const fields = z.object({
      repeated: z
        .array(
          z.object({
            bool: z.boolean(),
            int64: z.number().int(),
            numeric: z.number(),
            bigint: z.bigint(),
            string: z.string(),
            timestamp: z.date(),
            date: z.string().regex(RegExpDate),
            time: z.string().regex(RegExpTime),
          })
        )
        .nullable(),
    });
    type Type = z.infer<typeof fields>;
    expect(convert(fields)).toStrictEqual([
      {
        name: "repeated",
        mode: "REPEATED",
        type: "STRUCT",
        fields: [
          { name: "bool", type: "BOOL" },
          { name: "int64", type: "INT64" },
          { name: "numeric", type: "NUMERIC" },
          { name: "bigint", type: "BIGNUMERIC" },
          { name: "string", type: "STRING" },
          { name: "timestamp", type: "TIMESTAMP" },
          { name: "date", type: "DATE" },
          { name: "time", type: "TIME" },
        ],
      },
    ]);
  });
});

describe(`refineDate`, () => {
  it(`should refine min date string`, () => {
    const schema = z.string().regex(RegExpDate);
    const result = schema.parse("0001-01-01");
    expect(result).toBe("0001-01-01");
  });

  it(`should refine max date string`, () => {
    const schema = z.string().regex(RegExpDate);
    const result = schema.parse("9999-12-31");
    expect(result).toBe("9999-12-31");
  });
});

describe(`refineTime`, () => {
  it(`should refine min time string`, () => {
    const schema = z.string().regex(RegExpTime);
    const result = schema.parse("00:00:00");
    expect(result).toBe("00:00:00");
  });

  it(`should refine max time string`, () => {
    const schema = z.string().regex(RegExpTime);
    const result = schema.parse("23:59:59.999999");
    expect(result).toBe("23:59:59.999999");
  });
});
