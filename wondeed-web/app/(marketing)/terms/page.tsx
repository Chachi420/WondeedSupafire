export const metadata = {
  title: 'Terms of Service — Wondeed',
  description: 'Terms governing the use of Wondeed Technologies Pvt. Ltd. platform.',
}

export default function TermsPage() {
  return (
    <div className="section white" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow"><span className="dot" /> Legal</span>
        <h1 className="display-2" style={{ marginTop: 16 }}>Terms of Service</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--fg-mute)', fontFamily: 'var(--mono)' }}>Last updated: 1 May 2025 · Effective: 1 May 2025</p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>1. About Wondeed</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Wondeed is operated by <strong>Wondeed Technologies Pvt. Ltd.</strong> ("Wondeed", "we", "us", "our"), a company incorporated in India. Wondeed operates a performance-based short-form video marketplace that connects brands ("Brands") with content creators ("Clippers"). By accessing or using the platform, you agree to these Terms.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>2. Eligibility</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>You must be at least 18 years old and an Indian resident to use Wondeed. By using the platform, you represent that you meet these requirements. Brands must have a valid GSTIN or proof of registered business entity in India.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>3. Clipper Obligations</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Clippers agree to: (a) create original content that complies with the campaign brief; (b) post only on their connected, public Instagram or YouTube account; (c) not purchase views, use bots, or manipulate engagement metrics; (d) not delete or make private a submitted clip while view tracking is active; (e) comply with all applicable platform policies (Instagram, YouTube) and Indian law.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>4. Brand Obligations</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Brands agree to: (a) provide accurate campaign briefs and source media; (b) not request content that is misleading, illegal, or that violates third-party rights; (c) use the 72-hour rejection window for legitimate reasons only; (d) ensure they have rights to all brand assets provided in source packs.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>5. View Verification</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Views are verified exclusively via the Instagram Graph API (for Reels) or YouTube Data API (for Shorts). Wondeed's determination of verified view counts is final. Views undergo a 72-hour anomaly review period before being credited. Wondeed reserves the right to withhold earnings from clips with suspicious view patterns.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>6. Payments</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Brand deposits are processed via Razorpay. Clipper payouts are issued via UPI within 7 business days of a payout request, subject to a minimum balance of ₹500. Wondeed charges a platform fee to Brands, separate from the campaign budget deposited. The full deposited campaign budget is distributed to Clippers. All amounts are in Indian Rupees (INR).</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>7. Intellectual Property</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Clippers retain ownership of their clip content. By submitting a clip, Clippers grant Wondeed and the relevant Brand a non-exclusive, royalty-free licence to display, share, and promote the clip in connection with the campaign. Brands retain ownership of all brand assets provided in source packs.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>8. Account Termination</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Wondeed may suspend or terminate accounts that violate these Terms, attempt to manipulate the platform, or engage in prohibited conduct. Clippers with pending earnings at the time of termination for cause forfeit unpaid amounts. Clippers terminated without cause will be paid any verified, pending earnings.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>9. Limitation of Liability</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>To the extent permitted by applicable law, Wondeed's total liability to any user shall not exceed the amounts paid by or to that user in the 3 months preceding the claim. Wondeed is not liable for indirect, incidental, or consequential damages.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>10. Governing Law</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of [Registered City], India. Disputes may first be referred to arbitration under the Arbitration and Conciliation Act, 1996.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>11. Contact</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>For questions about these Terms, email <a href="mailto:legal@wondeed.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>legal@wondeed.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
