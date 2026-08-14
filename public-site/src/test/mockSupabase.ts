import { vi } from 'vitest'

export interface QueryResult {
  data: unknown
  error: unknown
}

const METHODS = [
  'select',
  'order',
  'eq',
  'limit',
  'maybeSingle',
  'single',
  'insert',
  'update',
  'delete',
] as const

type QueryBuilder = {
  [K in (typeof METHODS)[number]]: () => QueryBuilder
} & PromiseLike<QueryResult>

export function createQueryBuilder(result: QueryResult): QueryBuilder {
  const invoke = vi.fn(async (): Promise<QueryResult> => result)
  const builder = {} as QueryBuilder
  for (const name of METHODS) {
    builder[name] = vi.fn(() => builder)
  }
  builder.then = (onFulfilled, onRejected) => invoke().then(onFulfilled, onRejected)
  return builder
}