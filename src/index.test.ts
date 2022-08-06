import { z } from "zod";
import { convert, RegExpDate, RegExpTime } from ".";

describe(`convert`, () => {
  it(`should convert NaN`, () => {
    const fields = z.object({
      nan: z.nan(),
      nullable: z.nan().nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "nan",
        type: "NUMERIC",
      },
      {
        name: "nullable",
        type: "NUMERIC",
        mode: "NULLABLE",
      },
    ]);
  });

  it(`should not convert undefined`, () => {
    const fields = z.object({
      undefined: z.undefined(),
      nullable: z.undefined().nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert null`, () => {
    const fields = z.object({
      null: z.null(),
      nullable: z.null().nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert any`, () => {
    const fields = z.object({
      any: z.any(),
      nullable: z.any().nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert unknown`, () => {
    const fields = z.object({
      unknown: z.unknown(),
      nullable: z.unknown().nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert never`, () => {
    const fields = z.object({
      never: z.never(),
      nullable: z.never().nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert void`, () => {
    const fields = z.object({
      never: z.void(),
      nullable: z.void().nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert Literal`, () => {
    const fields = z.object({
      bool: z.literal(true).nullable(),
      numeric: z.literal(1).nullable(),
      bigint: z.literal(1000n).nullable(),
      string: z.literal("foo").nullable(),
      undefined: z.literal(undefined).nullable(),
      null: z.literal(null).nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      { name: "bool", type: "BOOL", mode: "NULLABLE" },
      { name: "numeric", type: "NUMERIC", mode: "NULLABLE" },
      { name: "bigint", type: "BIGNUMERIC", mode: "NULLABLE" },
      { name: "string", type: "STRING", mode: "NULLABLE" },
    ]);
  });

  it(`should convert Nullable`, () => {
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

  it(`should convert Optional`, () => {
    const fields = z.object({
      bool: z.boolean().optional(),
      int64: z.number().int().optional(),
      numeric: z.number().optional(),
      bigint: z.bigint().optional(),
      string: z.string().optional(),
      timestamp: z.date().optional(),
      date: z.string().regex(RegExpDate).optional(),
      time: z.string().regex(RegExpTime).optional(),
    });
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

  it(`should convert Object`, () => {
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

  it(`should convert Array`, () => {
    const fields = z.object({
      array: z.array(z.boolean().nullable()),
      nullable: z.array(z.boolean().nullable()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "array",
        mode: "REPEATED",
        type: "BOOL",
      },
      {
        name: "nullable",
        mode: "REPEATED",
        type: "BOOL",
      },
    ]);
  });

  it(`should not convert Array with ignored type`, () => {
    const fields = z.object({
      array: z.array(z.function()),
      nullable: z.array(z.function()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should convert Array<Object>`, () => {
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

  it(`should convert Tuple`, () => {
    const fields = z.object({
      tuple: z
        .tuple([
          z.boolean().nullable(),
          z.number().nullable(),
          z.string().nullable(),
        ])
        .nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "tuple",
        mode: "NULLABLE",
        type: "STRUCT",
        fields: [
          {
            name: "0",
            mode: "NULLABLE",
            type: "BOOL",
          },
          {
            name: "1",
            mode: "NULLABLE",
            type: "NUMERIC",
          },
          {
            name: "2",
            mode: "NULLABLE",
            type: "STRING",
          },
        ],
      },
    ]);
  });

  it(`should convert Record`, () => {
    const fields = z.object({
      record: z.record(z.number()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "record",
        mode: "REPEATED",
        type: "STRUCT",
        fields: [
          { name: "key", type: "STRING" },
          { name: "value", type: "NUMERIC" },
        ],
      },
    ]);
  });

  it(`should convert Map`, () => {
    const fields = z.object({
      map: z.map(z.string(), z.number()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "map",
        mode: "REPEATED",
        type: "STRUCT",
        fields: [
          { name: "key", type: "STRING" },
          { name: "value", type: "NUMERIC" },
        ],
      },
    ]);
  });

  it(`should convert Set`, () => {
    const fields = z.object({
      set: z.set(z.number().nullable()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "set",
        mode: "REPEATED",
        type: "NUMERIC",
      },
    ]);
  });

  it(`should not convert Set with ignored type`, () => {
    const fields = z.object({
      set: z.set(z.function()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should convert Set<Object>`, () => {
    const fields = z.object({
      set: z
        .set(
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
    expect(convert(fields)).toStrictEqual([
      {
        name: "set",
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

  it(`should convert Enum`, () => {
    const fields = z.object({
      enum: z.enum(["foo", "bar", "baz"]).nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "enum",
        type: "STRING",
        mode: "NULLABLE",
      },
    ]);
  });

  it(`should convert NativeEnum`, () => {
    enum Def {
      a = "foo",
      b = "bar",
      c = "baz",
    }
    const fields = z.object({
      enum: z.nativeEnum(Def).nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "enum",
        type: "STRING",
        mode: "NULLABLE",
      },
    ]);
  });

  it(`should convert Default`, () => {
    const fields = z.object({
      default: z.string().default("foo"),
      nullable: z.string().default("foo").nullable(),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "default",
        type: "STRING",
      },
      {
        name: "nullable",
        type: "STRING",
        mode: "NULLABLE",
      },
    ]);
  });

  it(`should convert Effect`, () => {
    const fields = z.object({
      effect: z.number().refine((num) => num === 100),
    });
    expect(convert(fields)).toStrictEqual([
      {
        name: "effect",
        type: "NUMERIC",
      },
    ]);
  });

  it(`should not convert Function`, () => {
    const fields = z.object({
      func: z
        .function()
        .args(z.string(), z.number())
        .returns(z.boolean())
        .nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert Promise`, () => {
    const fields = z.object({
      func: z.promise(z.number()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not convert Lazy`, () => {
    const fields = z.object({
      func: z.lazy(() => z.number()).nullable(),
    });
    expect(convert(fields)).toStrictEqual([]);
  });

  it(`should not support Union`, () => {
    const fields = z.object({
      union: z.union([z.number(), z.string()]),
    });
    expect(() => convert(fields)).toThrowError(
      /^Type "ZodUnion" is not supported in zoq\./
    );
  });

  it(`should not support Union created with .or()`, () => {
    const fields = z.object({
      union: z.number().or(z.string()),
    });
    expect(() => convert(fields)).toThrowError(
      /^Type "ZodUnion" is not supported in zoq\./
    );
  });

  it(`should not support Discriminated Union`, () => {
    const fields = z.object({
      discriminatedUnion: z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ]),
    });
    expect(() => convert(fields)).toThrowError(
      /^Type "ZodDiscriminatedUnion" is not supported in zoq\./
    );
  });

  it(`should not support Intersection`, () => {
    const fields = z.object({
      intersection: z.intersection(
        z.union([z.number(), z.string()]),
        z.union([z.number(), z.boolean()])
      ),
    });
    expect(() => convert(fields)).toThrowError(
      /^Type "ZodIntersection" is not supported in zoq\./
    );
  });

  it(`should not support Intersection created with .and()`, () => {
    const fields = z.object({
      intersection: z
        .union([z.number(), z.string()])
        .and(z.union([z.number(), z.boolean()])),
    });
    expect(() => convert(fields)).toThrowError(
      /^Type "ZodIntersection" is not supported in zoq\./
    );
  });
});

describe(`RegExpDate`, () => {
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

describe(`RegExpTime`, () => {
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
