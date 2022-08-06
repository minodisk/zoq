import type { TableField } from "@google-cloud/bigquery";
import type { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export const convert = <T extends ZodRawShape>(
  type: ZodObject<T>
): Array<TableField> => {
  return Object.entries(type.shape)
    .map(([name, value]) => convertAny(name, value))
    .filter(isField);
};

const isField = (field?: TableField): field is TableField => !!field;

const convertAny = (name: string, type: ZodTypeAny): TableField | undefined => {
  switch (type._def.typeName) {
    case "ZodLiteral": {
      switch (typeof type._def.value) {
        case "boolean":
          return {
            name,
            type: "BOOL",
          };
        case "number":
          return {
            name,
            type: "NUMERIC",
          };
        case "bigint":
          return {
            name,
            type: "BIGNUMERIC",
          };
        case "string":
          return {
            name,
            type: "STRING",
          };
        default:
          return;
      }
    }
    case "ZodArray": {
      const child = convertAny(name, type._def.type);
      if (!child) {
        return;
      }
      return {
        ...child,
        name,
        mode: "REPEATED",
      };
    }
    case "ZodObject":
      return {
        name,
        type: "STRUCT",
        fields: convert(type as ZodObject<{}>),
      };
    case "ZodTuple":
      return {
        name,
        type: "STRUCT",
        fields: type._def.items
          .map((item: ZodTypeAny, i: number) => {
            return convertAny(`${i}`, item);
          })
          .filter(isField),
      };
    case "ZodRecord":
    case "ZodMap":
      return {
        name,
        type: "STRUCT",
        mode: "REPEATED",
        fields: [
          convertAny("key", type._def.keyType),
          convertAny("value", type._def.valueType),
        ].filter(isField),
      };
    case "ZodSet": {
      const child = convertAny(name, type._def.valueType);
      if (!child) {
        return;
      }
      return {
        ...child,
        name,
        mode: "REPEATED",
      };
    }
    case "ZodBoolean":
      return {
        name,
        type: "BOOL",
      };
    case "ZodNumber":
      if (
        type._def.checks.some(
          ({ kind }: { kind: string; message?: string }) => kind === "int"
        )
      ) {
        return {
          name,
          type: "INT64",
        };
      }
      return {
        name,
        type: "NUMERIC",
      };
    case "ZodBigInt":
      return {
        name,
        type: "BIGNUMERIC",
      };
    case "ZodNaN":
      return {
        name,
        type: "NUMERIC",
      };
    case "ZodString": {
      const checks = (
        type._def.checks as Array<{ kind: string; regex: RegExp }>
      ).filter(({ kind }: { kind: string }) => kind === "regex");
      if (checks.some(({ regex }) => regex === RegExpDate)) {
        return {
          name,
          type: "DATE",
        };
      }
      if (checks.some(({ regex }) => regex === RegExpTime)) {
        return {
          name,
          type: "TIME",
        };
      }
      return {
        name,
        type: "STRING",
      };
    }
    case "ZodDate":
      return {
        name,
        type: "TIMESTAMP",
      };
    case "ZodEnum":
    case "ZodNativeEnum":
      return {
        name,
        type: "STRING",
      };
    case "ZodOptional":
    case "ZodNullable": {
      const child = convertAny(name, type._def.innerType);
      if (!child) {
        return;
      }
      return {
        mode: "NULLABLE",
        ...child,
        name,
      };
    }
    case "ZodDefault":
      return convertAny(name, type._def.innerType);
    case "ZodEffects":
      return convertAny(name, type._def.schema);
    case "ZodUndefined":
    case "ZodNull":
    case "ZodAny":
    case "ZodUnknown":
    case "ZodNever":
    case "ZodVoid":
    case "ZodFunction":
    case "ZodPromise":
    case "ZodLazy":
      return;
    default:
      throw new Error(
        `Type "${type._def.typeName}" is not supported in zoq. Must be translated into the types supported by BigQuery before conversion. See https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types`
      );
  }
};

export const RegExpDate = /\d{4}-\d{2}-\d{2}/;
export const RegExpTime = /\d{2}:\d{2}:\d{2}(:?.\d{1,6})?/;
