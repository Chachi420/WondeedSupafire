export const metadata = {
  title: 'Refund Policy — Wondeed',
  description: 'Wondeed\'s refund and cancellation policy for brand campaign deposits.',
}

export default function RefundPage() {
  return (
    <div className="section white" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow"><span className="dot" /> Legal</span>
        <h1 className="display-2" style={{ marginTop: 16 }}>Refund Policy</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--fg-mute)', fontFamily: 'var(--mono)' }}>Last updated: 1 May 2025</p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>1. Brand Campaign Deposits</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Campaign budgets are deposited into Wondeed's escrow pool at the start of a campaign. Once at least one clip has been approved and views have started being tracked, the deposit is non-refundable. The remaining unspent budget (i.e., the portion not yet earned by Clippers) can be credited to your Wondeed account and rolled over to a future campaign.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>2. Pre-Campaign Cancellation</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>If you cancel a campaign before any clip has been approved and views tracked, a refund of 90% of the deposited amount will be issued. The remaining 10% covers payment processing and platform setup costs. Cancellation must be requested by emailing <a href="mailto:support@wondeed.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>support@wondeed.com</a> within 48 hours of deposit.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>3. No-Clip Campaigns</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>If a campaign receives no clip submissions within 14 days of going live, Brands may request a full refund minus Razorpay transaction fees (typically 2%). This request must be made within 7 days of the campaign expiry.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>4. Clipper Earnings</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Clipper earnings, once verified and credited to a Clipper's account balance, are non-refundable to the Brand. This includes views earned before a clip was rejected during the 72-hour window.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>5. Refund Processing</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Approved refunds are processed within 7–10 business days to the original payment method. For UPI payments, the refund goes to the source UPI ID. For net banking or card payments, the refund goes to the source account.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>6. Contact</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>For refund requests, email <a href="mailto:support@wondeed.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>support@wondeed.com</a> with your campaign ID and the reason for cancellation.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
