import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export const useSupabaseFetch = async <T>(query: PostgrestFilterBuilder<T>, errorMessage: string) => {
  try {
    const { data, error, count } = await query
    console.log(count)
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error(errorMessage, error)
  }
}
