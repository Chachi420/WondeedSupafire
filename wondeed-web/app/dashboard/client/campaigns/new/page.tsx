import CampaignForm from '@/components/client/CampaignForm'
import Link from 'next/link'

export default function NewCampaignPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/dashboard/client/campaigns" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
          ← Back to campaigns
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your campaign is saved as a draft first. You can review and submit it for admin approval.
        </p>
      </div>
      <CampaignForm />
    </div>
  )
}
