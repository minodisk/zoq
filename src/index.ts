import type { TableField } from "@google-cloud/bigquery";
import type { ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { ZodFirstPartyTypeKind } from "zod";

export const convert = <T extends ZodRawShape>(
  type: ZodObject<T>
): Array<TableField> => {
  return Object.entries(type.shape).map(([name, value]) =>
    convertAny(name, value)
  );
};

const convertAny = (name: string, type: ZodTypeAny): TableField => {
  switch (type._def.typeName) {
    case ZodFirstPartyTypeKind.ZodNullable:
      return {
        mode: "NULLABLE",
        ...convertAny(name, type._def.innerType),
        name,
      };
    case ZodFirstPartyTypeKind.ZodArray:
      return {
        ...convertAny(name, type._def.type),
        name,
        mode: "REPEATED",
      };
    case ZodFirstPartyTypeKind.ZodObject:
      return {
        name,
        type: "STRUCT",
        fields: convert(type as ZodObject<any>),
      };
    case ZodFirstPartyTypeKind.ZodBoolean:
      return {
        name,
        type: "BOOL",
      };
    case ZodFirstPartyTypeKind.ZodNumber:
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
    case ZodFirstPartyTypeKind.ZodBigInt:
      return {
        name,
        type: "BIGNUMERIC",
      };
    case ZodFirstPartyTypeKind.ZodString: {
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
    case ZodFirstPartyTypeKind.ZodDate:
      return {
        name,
        type: "TIMESTAMP",
      };
    case ZodFirstPartyTypeKind.ZodEffects:
      return convertAny(name, type._def.schema);
    default:
      throw new Error(`typeName "${type._def.typeName}" is not defined`);
  }
};

export const RegExpDate = /\d{4}-\d{2}-\d{2}/;
export const RegExpTime = /\d{2}:\d{2}:\d{2}(:?.\d{1,6})?/;
