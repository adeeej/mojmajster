import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, message } = body

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('contact_messages')
    .insert({ name, email, message })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
