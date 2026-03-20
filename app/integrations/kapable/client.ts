/**
 * Kapable Data API client — drop-in replacement for Supabase client.
 *
 * Mirrors the Supabase fluent builder pattern:
 *   const { data, error } = await kapable.from("clients").select("*").eq("id", id).maybeSingle();
 *
 * Client-side: routes through BFF proxy at /api/kapable/* (auth handled server-side).
 * Server-side: can be instantiated with a direct URL + data key.
 */

type FilterOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is";

interface Filter {
  column: string;
  op: FilterOp;
  value: unknown;
}

interface KapableResponse<T> {
  data: T;
  error: { message: string; code?: string } | null;
}

class QueryBuilder<T = Record<string, unknown>> {
  private _table: string;
  private _baseUrl: string;
  private _method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private _body?: unknown;
  private _filters: Filter[] = [];
  private _ordering: { column: string; ascending: boolean }[] = [];
  private _limitVal?: number;
  private _offsetVal?: number;
  private _selectColumns?: string;
  private _singleRow = false;
  private _maybeSingleRow = false;

  constructor(baseUrl: string, table: string) {
    this._baseUrl = baseUrl;
    this._table = table;
  }

  select(columns?: string): this {
    this._selectColumns = columns || "*";
    return this;
  }

  eq(column: string, value: unknown): this {
    this._filters.push({ column, op: "eq", value });
    return this;
  }

  neq(column: string, value: unknown): this {
    this._filters.push({ column, op: "neq", value });
    return this;
  }

  gt(column: string, value: unknown): this {
    this._filters.push({ column, op: "gt", value });
    return this;
  }

  gte(column: string, value: unknown): this {
    this._filters.push({ column, op: "gte", value });
    return this;
  }

  lt(column: string, value: unknown): this {
    this._filters.push({ column, op: "lt", value });
    return this;
  }

  lte(column: string, value: unknown): this {
    this._filters.push({ column, op: "lte", value });
    return this;
  }

  like(column: string, value: string): this {
    this._filters.push({ column, op: "like", value });
    return this;
  }

  ilike(column: string, value: string): this {
    this._filters.push({ column, op: "ilike", value });
    return this;
  }

  in(column: string, values: unknown[]): this {
    this._filters.push({ column, op: "in", value: values });
    return this;
  }

  is(column: string, value: null | boolean): this {
    this._filters.push({ column, op: "is", value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }): this {
    this._ordering.push({ column, ascending: opts?.ascending ?? true });
    return this;
  }

  limit(n: number): this {
    this._limitVal = n;
    return this;
  }

  range(from: number, to: number): this {
    this._offsetVal = from;
    this._limitVal = to - from + 1;
    return this;
  }

  insert(data: Partial<T> | Partial<T>[]): QueryBuilder<T> {
    this._method = "POST";
    this._body = data;
    return this;
  }

  upsert(data: Partial<T> | Partial<T>[], _opts?: { onConflict?: string }): QueryBuilder<T> {
    // Kapable has no native upsert — we POST and let the caller handle conflicts
    this._method = "POST";
    this._body = data;
    return this;
  }

  update(data: Partial<T>): QueryBuilder<T> {
    this._method = "PATCH";
    this._body = data;
    return this;
  }

  delete(): QueryBuilder<T> {
    this._method = "DELETE";
    return this;
  }

  single(): PromiseLike<KapableResponse<T>> {
    this._singleRow = true;
    return this;
  }

  maybeSingle(): PromiseLike<KapableResponse<T | null>> {
    this._maybeSingleRow = true;
    return this;
  }

  // --- URL building ---

  private buildUrl(): string {
    // For PATCH/DELETE with a single id=eq filter, use path-based endpoint
    const idFilter = this._filters.find((f) => f.column === "id" && f.op === "eq");
    const isPathBased =
      (this._method === "PATCH" || this._method === "DELETE" || this._method === "GET") &&
      idFilter &&
      this._filters.length === 1 &&
      (this._method !== "GET" || this._singleRow || this._maybeSingleRow);

    let url: string;
    if (isPathBased && idFilter) {
      url = `${this._baseUrl}/${this._table}/${idFilter.value}`;
    } else {
      url = `${this._baseUrl}/${this._table}`;
    }

    const params = new URLSearchParams();

    // Add filters as where= params (skip id filter if used in path)
    for (const f of this._filters) {
      if (isPathBased && f === idFilter) continue;
      const val = f.value === null ? "null" : String(f.value);
      params.append("where", `${f.column}.${f.op}.${val}`);
    }

    // Ordering — join multiple orders into a single comma-separated param
    // (Kapable API rejects duplicate "order" query params)
    if (this._ordering.length > 0) {
      const orderVal = this._ordering
        .map((o) => `${o.column}.${o.ascending ? "asc" : "desc"}`)
        .join(",");
      params.set("order", orderVal);
    }

    // Pagination
    if (this._limitVal !== undefined) params.set("limit", String(this._limitVal));
    if (this._offsetVal !== undefined) params.set("offset", String(this._offsetVal));

    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }

  // --- Execution ---

  private async execute(): Promise<KapableResponse<any>> {
    const url = this.buildUrl();
    const init: RequestInit = { method: this._method };

    if (this._body !== undefined) {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(this._body);
    }

    try {
      const res = await fetch(url, init);
      const json = await res.json();

      if (!res.ok) {
        return {
          data: null,
          error: {
            message: json.error?.message || `Request failed (${res.status})`,
            code: json.error?.code,
          },
        };
      }

      // Normalize response to Supabase { data, error } format
      return this.normalizeResponse(json);
    } catch (err) {
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : "Network error" },
      };
    }
  }

  private normalizeResponse(json: unknown): KapableResponse<any> {
    // Path-based single-row responses return the row directly (no .data wrapper)
    if (this._singleRow || this._maybeSingleRow) {
      // GET /v1/table/id returns { id, col1, col2, ... } directly
      if (json && typeof json === "object" && !("data" in json)) {
        return { data: json, error: null };
      }
      // GET /v1/table?where=... returns { data: [...] }
      if (json && typeof json === "object" && "data" in json) {
        const arr = (json as any).data;
        if (Array.isArray(arr)) {
          if (arr.length === 0) {
            return { data: this._maybeSingleRow ? null : null, error: this._singleRow ? { message: "Row not found" } : null };
          }
          return { data: arr[0], error: null };
        }
      }
      return { data: json, error: null };
    }

    // List responses: { data: [...], pagination: {...} }
    if (json && typeof json === "object" && "data" in json) {
      return { data: (json as any).data, error: null };
    }

    // POST/PATCH/DELETE responses return the row directly
    return { data: json, error: null };
  }

  // Make the builder thenable — `await builder` triggers execution
  then<TResult1 = KapableResponse<any>, TResult2 = never>(
    onfulfilled?: ((value: KapableResponse<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class KapableClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  from<T = Record<string, unknown>>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(this.baseUrl, table);
  }
}

// Default client instance — routes through BFF proxy (client-side safe)
export const kapable = new KapableClient("/api/kapable");

// Factory for server-side usage with direct API access
export function createKapableClient(baseUrl: string): KapableClient {
  return new KapableClient(baseUrl);
}

export type { KapableResponse, QueryBuilder };
