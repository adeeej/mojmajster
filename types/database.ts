export type MasterStatus = 'pending' | 'approved' | 'rejected' | 'banned'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type EventType = 'profile_view' | 'phone_click' | 'lead_sent'

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  created_at: string
}

export interface Master {
  id: number
  user_id: string
  name: string
  business_name: string | null
  slug: string
  category_id: number
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  city: string
  region: string
  lat: number | null
  lng: number | null
  service_radius_km: number
  languages: string[]
  ico: string | null
  verified: boolean
  status: MasterStatus
  photo_url: string | null
  created_at: string
  updated_at: string
  // Joined
  category?: Category
  photos?: MasterPhoto[]
  reviews?: Review[]
  avg_rating?: number
  review_count?: number
}

export interface MasterPhoto {
  id: number
  master_id: number
  url: string
  caption: string | null
  sort_order: number
}

export interface Review {
  id: number
  master_id: number
  author_name: string
  author_email: string
  rating: number
  text: string
  status: ReviewStatus
  created_at: string
}

export interface Lead {
  id: number
  master_id: number
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
  read_at: string | null
}

export interface AnalyticsEvent {
  id: number
  master_id: number
  event_type: EventType
  created_at: string
}
