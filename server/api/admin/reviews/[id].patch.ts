import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { error } = await client
    .from('reviews')
    .update({ status: body.status })
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
