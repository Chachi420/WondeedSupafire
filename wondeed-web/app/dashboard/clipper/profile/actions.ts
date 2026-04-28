'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getClipperUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

function extractYouTubeChannelParts(url: string): { type: 'id' | 'handle' | 'custom'; value: string } | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('youtube.com')) return null

    const channelMatch = u.pathname.match(/^\/channel\/(UC[\w-]+)/)
    if (channelMatch) return { type: 'id', value: channelMatch[1] }

    const handleMatch = u.pathname.match(/^\/@([\w.-]+)/)
    if (handleMatch) return { type: 'handle', value: handleMatch[1] }

    const customMatch = u.pathname.match(/^\/c\/([\w.-]+)/)
    if (customMatch) return { type: 'custom', value: customMatch[1] }

    return null
  } catch {
    return null
  }
}

export async function linkYouTubeChannel(channelUrl: string) {
  const user = await getClipperUser()
  const API_KEY = process.env.YOUTUBE_API_KEY
  if (!API_KEY) throw new Error('YouTube API not configured')

  const parsed = extractYouTubeChannelParts(channelUrl.trim())
  if (!parsed) {
    throw new Error(
      'Invalid YouTube channel URL. Use: youtube.com/@handle or youtube.com/channel/UCxxxx'
    )
  }

  let apiUrl: string
  if (parsed.type === 'id') {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${encodeURIComponent(parsed.value)}&key=${API_KEY}`
  } else {
    // forHandle works for both @handle and /c/custom (YouTube resolves both)
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(parsed.value)}&key=${API_KEY}`
  }

  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error('Failed to reach YouTube API')

  const data = await res.json()
  if (!data.items?.length) {
    throw new Error(`Channel not found on YouTube. Check the URL and make sure the channel is public.`)
  }

  const channel = data.items[0]
  const channelId:     string = channel.id
  const channelTitle:  string = channel.snippet.title
  const channelHandle: string = channel.snippet.customUrl ?? `@${parsed.value}`

  const db = createAdminClient()
  const { error } = await db.from('clipper_social_accounts').upsert({
    clipper_id:             user.id,
    youtube_channel_id:     channelId,
    youtube_channel_handle: channelHandle,
    youtube_channel_title:  channelTitle,
    youtube_verified_at:    new Date().toISOString(),
    updated_at:             new Date().toISOString(),
  }, { onConflict: 'clipper_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/clipper/profile')

  return { channelId, channelHandle, channelTitle }
}

export async function unlinkYouTubeChannel() {
  const user = await getClipperUser()
  const db = createAdminClient()
  await db.from('clipper_social_accounts').upsert({
    clipper_id:             user.id,
    youtube_channel_id:     null,
    youtube_channel_handle: null,
    youtube_channel_title:  null,
    youtube_verified_at:    null,
    updated_at:             new Date().toISOString(),
  }, { onConflict: 'clipper_id' })
  revalidatePath('/dashboard/clipper/profile')
}

export async function unlinkInstagram() {
  const user = await getClipperUser()
  const db = createAdminClient()
  await db.from('clipper_social_accounts').upsert({
    clipper_id:                 user.id,
    instagram_user_id:          null,
    instagram_username:         null,
    instagram_access_token:     null,
    instagram_token_expires_at: null,
    instagram_connected_at:     null,
    updated_at:                 new Date().toISOString(),
  }, { onConflict: 'clipper_id' })
  revalidatePath('/dashboard/clipper/profile')
}
