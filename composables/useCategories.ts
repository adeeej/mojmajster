import type { Category } from '~/types/database'

export function useCategories() {
  const client = useSupabaseClient()

  async function fetchCategories(): Promise<Category[]> {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Category[]
  }

  return { fetchCategories }
}

export const categoryIconMap: Record<string, string> = {
  'brick-wall': '🧱',
  'home': '🏠',
  'flame': '🔥',
  'zap': '⚡',
  'droplets': '💧',
  'paintbrush': '🎨',
  'square': '🔲',
  'tree-pine': '🪵',
  'lock': '🔒',
  'layers': '📐',
  'wrench': '🔧',
  'thermometer': '🌡️',
  'flower': '🌿',
  'shield': '🛡️',
  'building': '🏗️',
}
