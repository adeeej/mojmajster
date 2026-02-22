import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)

  const { count, error } = await client
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { count: count || 0 }
})
