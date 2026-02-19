<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">{{ $t('profile.edit') }}</h1>

    <UiCard v-if="master?.status === 'pending'" class="p-4 mb-6 border-yellow-300 bg-yellow-50">
      <p class="text-yellow-800">{{ $t('profile.pendingMessage') }}</p>
    </UiCard>

    <form class="space-y-4" @submit.prevent="saveProfile">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.name') }} *</label>
          <UiInput v-model="form.name" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.businessName') }}</label>
          <UiInput v-model="form.business_name" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('profile.category') }} *</label>
        <UiSelect v-model="form.category_id" required>
          <option value="" disabled>{{ $t('profile.selectCategory') }}</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </UiSelect>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('profile.description') }}</label>
        <UiTextarea v-model="form.description" :placeholder="$t('profile.descriptionPlaceholder')" rows="4" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.phone') }}</label>
          <UiInput v-model="form.phone" type="tel" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.email') }}</label>
          <UiInput v-model="form.email" type="email" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('profile.website') }}</label>
        <UiInput v-model="form.website" type="url" placeholder="https://" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.city') }} *</label>
          <UiInput v-model="form.city" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.region') }}</label>
          <UiInput v-model="form.region" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.serviceRadius') }}</label>
          <UiInput v-model.number="form.service_radius_km" type="number" min="1" max="200" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('profile.ico') }}</label>
          <UiInput v-model="form.ico" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('profile.languages') }}</label>
        <div class="flex flex-wrap gap-2">
          <label v-for="lang in ['SK', 'CZ', 'PL', 'EN', 'DE', 'HU']" :key="lang" class="flex items-center gap-1">
            <input
              type="checkbox"
              :value="lang"
              :checked="form.languages.includes(lang)"
              class="rounded"
              @change="toggleLanguage(lang)"
            />
            <span class="text-sm">{{ lang }}</span>
          </label>
        </div>
      </div>

      <!-- Profile Photo -->
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('profile.photo') }}</label>
        <input type="file" accept="image/*" class="text-sm" @change="handlePhotoUpload" />
        <div v-if="form.photo_url" class="mt-2 w-24 h-24 rounded-lg overflow-hidden">
          <img :src="form.photo_url" alt="Profile" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Work Photos -->
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('profile.workPhotos') }}</label>
        <input type="file" accept="image/*" multiple class="text-sm" @change="handleWorkPhotosUpload" />
        <div v-if="workPhotos.length > 0" class="mt-2 grid grid-cols-4 gap-2">
          <div v-for="(photo, i) in workPhotos" :key="i" class="aspect-square rounded-lg overflow-hidden relative">
            <img :src="photo.url" alt="" class="w-full h-full object-cover" />
            <button
              type="button"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              @click="removeWorkPhoto(i)"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      <!-- Availability calendar -->
      <div v-if="master" class="border rounded-lg p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-sm">{{ $t('availability.title') }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ $t('availability.description') }}</p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.show_availability"
              type="checkbox"
              class="rounded"
            />
            <span class="text-sm">{{ $t('availability.enable') }}</span>
          </label>
        </div>
        <AvailabilityCalendar v-if="form.show_availability" :master-id="master.id" :editable="true" />
      </div>

      <UiButton type="submit" :disabled="saving" size="lg" class="w-full">
        {{ $t('profile.save') }}
      </UiButton>
      <p v-if="saveSuccess" class="text-green-600 text-sm">{{ $t('profile.saveSuccess') }}</p>
      <p v-if="saveError" class="text-destructive text-sm">{{ $t('profile.saveError') }}: {{ saveErrorMsg }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Category, Master, MasterPhoto } from '~/types/database'

definePageMeta({ middleware: 'auth' })

// Redirect admin users away from the craftsman profile page
const { data: adminCheck } = await useAsyncData('profile-admin-check', () => $fetch('/api/admin/check'))
if (adminCheck.value?.isAdmin) {
  await navigateTo('/admin')
}

const user = useSupabaseUser()
const client = useSupabaseClient()
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref(false)
const saveErrorMsg = ref('')

const form = reactive({
  name: '',
  business_name: '',
  category_id: '' as string | number,
  description: '',
  phone: '',
  email: '',
  website: '',
  city: '',
  region: 'Kysuce',
  service_radius_km: 30,
  languages: ['SK'] as string[],
  ico: '',
  photo_url: '',
  show_availability: false,
})

const workPhotos = ref<MasterPhoto[]>([])

const { data: categories } = await useAsyncData('profile-categories', async () => {
  const { data } = await client.from('categories').select('*').order('name')
  return (data || []) as Category[]
}, { server: false })

const { data: master } = await useAsyncData('my-profile', async () => {
  if (!user.value) return null
  const { data } = await client
    .from('masters')
    .select('*')
    .eq('user_id', user.value.id)
    .single()
  return data as Master | null
}, { server: false })

// Load existing data
if (master.value) {
  Object.assign(form, {
    name: master.value.name,
    business_name: master.value.business_name || '',
    category_id: master.value.category_id,
    description: master.value.description || '',
    phone: master.value.phone || '',
    email: master.value.email || '',
    website: master.value.website || '',
    city: master.value.city,
    region: master.value.region,
    service_radius_km: master.value.service_radius_km,
    languages: master.value.languages || ['SK'],
    ico: master.value.ico || '',
    photo_url: master.value.photo_url || '',
    show_availability: master.value.show_availability || false,
  })

  // Load work photos
  const { data: existingPhotos } = await client
    .from('master_photos')
    .select('*')
    .eq('master_id', master.value.id)
    .order('sort_order')
  workPhotos.value = (existingPhotos || []) as MasterPhoto[]
}

function toggleLanguage(lang: string) {
  const idx = form.languages.indexOf(lang)
  if (idx >= 0) form.languages.splice(idx, 1)
  else form.languages.push(lang)
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function handlePhotoUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !user.value) return

  const ext = file.name.split('.').pop()
  const path = `profiles/${user.value.id}/avatar.${ext}`

  const { error } = await client.storage.from('photos').upload(path, file, { upsert: true })
  if (!error) {
    const { data } = client.storage.from('photos').getPublicUrl(path)
    form.photo_url = data.publicUrl
  }
}

async function handleWorkPhotosUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || !user.value) return

  for (const file of Array.from(files)) {
    const ext = file.name.split('.').pop()
    const path = `profiles/${user.value.id}/work-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await client.storage.from('photos').upload(path, file)
    if (!error) {
      const { data } = client.storage.from('photos').getPublicUrl(path)
      workPhotos.value.push({
        id: 0,
        master_id: master.value?.id || 0,
        url: data.publicUrl,
        caption: null,
        sort_order: workPhotos.value.length,
      })
    }
  }
}

function removeWorkPhoto(index: number) {
  workPhotos.value.splice(index, 1)
}

async function saveProfile() {
  if (!user.value) return
  saving.value = true
  saveSuccess.value = false
  saveError.value = false

  const slug = generateSlug(form.name)
  const profileData = {
    user_id: user.value.id,
    name: form.name,
    business_name: form.business_name || null,
    slug,
    category_id: Number(form.category_id),
    description: form.description || null,
    phone: form.phone || null,
    email: form.email || null,
    website: form.website || null,
    city: form.city,
    region: form.region || 'Kysuce',
    service_radius_km: form.service_radius_km,
    languages: form.languages,
    ico: form.ico || null,
    photo_url: form.photo_url || null,
    show_availability: form.show_availability,
  }

  let masterId = master.value?.id

  if (master.value) {
    const { error } = await client
      .from('masters')
      .update(profileData)
      .eq('id', master.value.id)
    if (error) {
      saving.value = false
      saveError.value = true
      saveErrorMsg.value = error.message
      return
    }
  } else {
    const { data, error } = await client
      .from('masters')
      .insert({ ...profileData, status: 'pending' })
      .select()
      .single()
    if (error || !data) {
      saving.value = false
      saveError.value = true
      saveErrorMsg.value = error?.message || 'Unknown error'
      return
    }
    masterId = data.id
  }

  // Sync work photos
  if (masterId) {
    await client.from('master_photos').delete().eq('master_id', masterId)
    if (workPhotos.value.length > 0) {
      await client.from('master_photos').insert(
        workPhotos.value.map((p, i) => ({
          master_id: masterId,
          url: p.url,
          caption: p.caption,
          sort_order: i,
        }))
      )
    }
  }

  saving.value = false
  saveSuccess.value = true
}
</script>
