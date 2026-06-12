export const metadata = {
  title: 'GST Information — Wondeed',
  description: 'GST details for Wondeed — tax invoices, and billing information.',
}

export default function GSTPage() {
  return (
    <div className="section white" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow"><span className="dot" /> Legal</span>
        <h1 className="display-2" style={{ marginTop: 16 }}>GST Information</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--fg-mute)', fontFamily: 'var(--mono)' }}>For invoicing and compliance queries</p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div style={{ background: 'var(--paper)', borderRadius: 16, padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { l: 'Legal entity', v: 'Wondeed' },
              { l: 'GSTIN', v: 'To be updated' },
              { l: 'HSN / SAC code', v: '998361 (Online marketplace services)' },
              { l: 'GST rate', v: '18% on platform fees' },
              { l: 'Invoice currency', v: 'INR (₹)' },
              { l: 'Billing contact', v: 'billing@wondeed.com' },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-mute)', marginBottom: 4 }}>{f.l}</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>{f.v}</div>
              </div>
            ))}
          </div>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>GST Applicability</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Wondeed charges GST at 18% on its platform fee, which is invoiced separately from the campaign deposit. The campaign deposit itself is not subject to GST — it is held in escrow and disbursed to Clippers as earnings. Brands registered for GST can claim Input Tax Credit (ITC) on the platform fee GST charged by Wondeed.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>Invoices for Brands</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>GST-compliant tax invoices are generated automatically after each campaign deposit and platform fee payment. Invoices are available for download from your Brand dashboard under Billing. For invoice corrections or missing invoices, email <a href="mailto:billing@wondeed.com" style={{ color: 'var(--fg)', fontWeight: 600 }}>billing@wondeed.com</a>.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>Clipper TDS</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>Clippers earning above the TDS threshold under Section 194-O of the Income Tax Act, 1961 will have TDS deducted at the applicable rate before payout. Wondeed issues Form 26AS-reconcilable TDS certificates for all deductions. Clippers are responsible for filing their own income tax returns.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>Contact</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>For GST and billing queries, email <a href="mailto:billing@wondeed.com" style={{ color: 'var(--fg)', fontWeight: 600 }}>billing@wondeed.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
