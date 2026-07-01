export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPagination<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function normalizePage(page?: number): number {
  if (!page || page < 1) return 1;
  return Math.floor(page);
}

export function normalizeLimit(limit?: number, max = 50, def = 10): number {
  if (!limit || limit < 1) return def;
  return Math.floor(Math.min(limit, max));
}
