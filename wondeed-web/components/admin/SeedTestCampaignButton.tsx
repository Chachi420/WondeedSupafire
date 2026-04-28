'use client'

import { useState, useTransition } from 'react'
import { seedTestCampaign } from '@/app/dashboard/admin/actions'

export default function SeedTestCampaignButton() {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  function handleClick() {
    setDone(false)
    startTransition(async () => {
      try {
        await seedTestCampaign()
        setDone(true)
      } catch (e: any) {
        alert('Failed: ' + e.message)
      }
    })
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Campaign live! Go to clipper → Submit a Clip
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      {isPending ? 'Creating…' : 'Seed Test Campaign'}
    </button>
  )
}
