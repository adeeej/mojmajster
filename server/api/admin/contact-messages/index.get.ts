import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)

  const { data, error } = await client
    .from('contact_messages')
    .select('*')
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
