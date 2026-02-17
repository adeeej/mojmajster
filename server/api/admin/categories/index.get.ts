import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)

  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { data }
})
