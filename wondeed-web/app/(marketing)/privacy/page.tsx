export const metadata = {
  title: 'Privacy Policy — Wondeed',
  description: 'How Wondeed Technologies Pvt. Ltd. collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="section white" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow"><span className="dot" /> Legal</span>
        <h1 className="display-2" style={{ marginTop: 16 }}>Privacy Policy</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--fg-mute)', fontFamily: 'var(--mono)' }}>Last updated: 1 May 2025 · Compliant with DPDP Act 2023</p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>1. Who We Are</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Wondeed Technologies Pvt. Ltd. ("Wondeed") is the data fiduciary for personal data collected through the Wondeed platform. Contact: <a href="mailto:privacy@wondeed.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>privacy@wondeed.com</a>.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>2. Data We Collect</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8, marginBottom: 10 }}>We collect the following categories of personal data:</p>
            <ul style={{ color: 'var(--fg-mute)', lineHeight: 1.8, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong style={{ color: 'var(--ink)' }}>Identity:</strong> Indian mobile number (used for OTP login).</li>
              <li><strong style={{ color: 'var(--ink)' }}>Financial:</strong> UPI ID (for payouts to Clippers). We do not store full payment card details — these are handled by Razorpay.</li>
              <li><strong style={{ color: 'var(--ink)' }}>Social media metrics:</strong> Public view counts, play data, and post metadata fetched via the Instagram Graph API and YouTube Data API for connected accounts.</li>
              <li><strong style={{ color: 'var(--ink)' }}>Usage data:</strong> Pages visited, dashboard actions, and session information for platform improvement.</li>
              <li><strong style={{ color: 'var(--ink)' }}>Business identity (Brands only):</strong> Company name, GSTIN, contact email.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>3. How We Use Your Data</h2>
            <ul style={{ color: 'var(--fg-mute)', lineHeight: 1.8, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Verifying your identity and enabling account access.</li>
              <li>Processing campaign submissions and calculating verified view earnings.</li>
              <li>Issuing UPI payouts to Clippers.</li>
              <li>Sending transactional notifications (payout confirmations, clip approval status).</li>
              <li>Detecting fraud, view manipulation, and platform abuse.</li>
              <li>Improving platform features based on aggregated usage analytics.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>4. Third-Party Services</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>We use the following third-party processors:</p>
            <ul style={{ color: 'var(--fg-mute)', lineHeight: 1.8, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <li><strong style={{ color: 'var(--ink)' }}>Razorpay:</strong> Payment processing for Brand deposits and Clipper payouts. Governed by Razorpay's Privacy Policy.</li>
              <li><strong style={{ color: 'var(--ink)' }}>Meta (Instagram Graph API):</strong> Read-only access to public media metrics on connected Clipper accounts.</li>
              <li><strong style={{ color: 'var(--ink)' }}>Google (YouTube Data API):</strong> Read-only access to public video metrics on connected Clipper accounts.</li>
              <li><strong style={{ color: 'var(--ink)' }}>Supabase:</strong> Database and authentication infrastructure. Data is stored in secure, encrypted databases.</li>
            </ul>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8, marginTop: 10 }}>We do not sell your personal data to any third party.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>5. Data Retention</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>We retain account data for the duration of your account and for 3 years after account closure for legal and tax compliance. UPI IDs are deleted within 30 days of account closure. Social media access tokens are revoked on account disconnection.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>6. Your Rights (DPDP Act 2023)</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Under the Digital Personal Data Protection Act 2023, you have the right to: access your personal data; correct inaccurate data; request erasure of your data (subject to legal retention obligations); and withdraw consent. To exercise these rights, email <a href="mailto:privacy@wondeed.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>privacy@wondeed.com</a>. We respond within 30 days.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>7. Contact</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Privacy enquiries: <a href="mailto:privacy@wondeed.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>privacy@wondeed.com</a>. For grievances, see our <a href="/grievance" style={{ color: 'var(--ink)', fontWeight: 600 }}>Grievance Officer</a> page.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
