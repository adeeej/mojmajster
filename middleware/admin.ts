export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/prihlasenie')
  }

  // Server-side check for admin access
  const { data } = await useFetch('/api/admin/check')
  if (!data.value?.isAdmin) {
    return navigateTo('/')
  }
})
