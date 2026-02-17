import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const config = useRuntimeConfig()

  const isAdmin = user?.email === config.adminEmail

  return { isAdmin }
})
