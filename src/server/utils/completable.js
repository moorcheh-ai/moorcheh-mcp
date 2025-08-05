import { z } from 'zod';

// ========== COMPLETABLE FUNCTIONALITY ==========

// Enum for MCP Zod Type Kind
const McpZodTypeKind = {
  Completable: "McpCompletable"
};

// Main Completable class
class Completable extends z.ZodType {
  constructor(def) {
    super(def);
    this._def = def;
  }

  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx,
    });
  }

  unwrap() {
    return this._def.type;
  }

  static create(type, params) {
    return new Completable({
      type,
      typeName: McpZodTypeKind.Completable,
      complete: params.complete,
      ...processCreateParams(params),
    });
  }
}

// Helper function to process create parameters
function processCreateParams(params) {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`,
    );
  }
  
  if (errorMap) return { errorMap: errorMap, description };
  
  const customMap = (iss, ctx) => {
    const { message } = params;

    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  
  return { errorMap: customMap, description };
}

/**
 * Wraps a Zod type to provide autocompletion capabilities. Useful for, e.g., prompt arguments in MCP.
 */
function completable(schema, complete) {
  return Completable.create(schema, { ...schema._def, complete });
}

export { Completable, completable, McpZodTypeKind }; 