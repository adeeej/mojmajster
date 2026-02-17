import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)
  const query = getQuery(event)
  const status = (query.status as string) || 'pending'

  const { data, error } = await client
    .from('masters')
    .select('*, category:categories(*)')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { data }
})
