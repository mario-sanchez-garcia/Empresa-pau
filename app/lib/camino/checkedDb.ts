import type { SupabaseClient } from '@supabase/supabase-js'

/** Planner reads must distinguish an empty result from a failed query. */
export function checkedDb(db: SupabaseClient): SupabaseClient {
  return new Proxy(db, {
    get(target, property, receiver) {
      if (property === 'from') return (table: string) => {
        const builder = target.from(table)
        return new Proxy(builder, {
          get(query, method) {
            const value = Reflect.get(query, method)
            if (typeof value !== 'function') return value
            return (...args: unknown[]) => value.apply(query, args).throwOnError()
          },
        })
      }
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}
