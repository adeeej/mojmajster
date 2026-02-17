import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const client = await requireAdmin(event)
  const body = await readBody(event)

  const { error } = await client
    .from('categories')
    .insert({
      name: body.name,
      slug: body.slug,
      icon: body.icon || 'wrench',
    })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
