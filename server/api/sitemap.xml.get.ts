import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl

  const { data: masters } = await client
    .from('masters')
    .select('slug, updated_at')
    .eq('status', 'approved')

  const { data: categories } = await client
    .from('categories')
    .select('slug')

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${siteUrl}/hladaj</loc><priority>0.8</priority></url>`

  for (const cat of categories || []) {
    xml += `\n  <url><loc>${siteUrl}/hladaj?category=${cat.slug}</loc><priority>0.7</priority></url>`
  }

  for (const master of masters || []) {
    xml += `\n  <url><loc>${siteUrl}/majster/${master.slug}</loc><lastmod>${master.updated_at}</lastmod><priority>0.6</priority></url>`
  }

  xml += '\n</urlset>'

  setResponseHeader(event, 'content-type', 'application/xml')
  return xml
})
