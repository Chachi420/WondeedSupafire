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
      <span className="btn btn-success" style={{ cursor: 'default' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 14, height: 14 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Campaign live! Go to clipper → Submit a Clip
      </span>
    )
  }

  return (
    <button onClick={handleClick} disabled={isPending} className="btn btn-secondary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      {isPending ? 'Creating…' : 'Seed Test Campaign'}
    </button>
  )
}
