import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  if (user.email !== config.adminEmail) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  return serverSupabaseServiceRole(event)
}
