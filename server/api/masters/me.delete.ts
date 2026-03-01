import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('masters')
    .delete()
    .eq('user_id', user.id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
