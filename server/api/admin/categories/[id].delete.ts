import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const { error } = await client
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
