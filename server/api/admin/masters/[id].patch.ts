import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updateData: Record<string, unknown> = {}
  if (body.status) updateData.status = body.status
  if (body.verified !== undefined) updateData.verified = body.verified

  const { error } = await client
    .from('masters')
    .update(updateData)
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
