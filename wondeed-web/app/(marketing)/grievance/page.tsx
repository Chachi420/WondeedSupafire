export const metadata = {
  title: 'Grievance Officer — Wondeed',
  description: 'Grievance redressal contact for Wondeed under the IT Act 2000 and DPDP Act 2023.',
}

export default function GrievancePage() {
  return (
    <div className="section white" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow"><span className="dot" /> Legal</span>
        <h1 className="display-2" style={{ marginTop: 16 }}>Grievance Officer</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--fg-mute)', fontFamily: 'var(--mono)' }}>As required under the IT Act 2000 and DPDP Act 2023</p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div style={{ background: 'var(--paper)', borderRadius: 16, padding: '28px 32px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-mute)', marginBottom: 20 }}>Grievance Officer Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {[
                { l: 'Name',         v: 'Grievance Officer, Wondeed' },
                { l: 'Designation',  v: 'Grievance Officer' },
                { l: 'Company',      v: 'Wondeed' },
                { l: 'Email',        v: 'grievance@wondeed.com' },
                { l: 'Response time', v: 'Within 24 hours (acknowledgment)' },
                { l: 'Resolution',   v: 'Within 30 days of receipt' },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-mute)', marginBottom: 4 }}>{f.l}</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>
                    {f.l === 'Email' ? <a href="mailto:grievance@wondeed.com" style={{ color: 'var(--fg)' }}>{f.v}</a> : f.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>How to File a Grievance</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>You may file a grievance regarding: (a) content moderation decisions; (b) account suspension or termination; (c) data privacy concerns; (d) payment disputes; or (e) any other issue with the Wondeed platform. Email <a href="mailto:grievance@wondeed.com" style={{ color: 'var(--fg)', fontWeight: 600 }}>grievance@wondeed.com</a> with your registered mobile number, a description of your grievance, and any supporting evidence.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>What to Expect</h2>
            <ul style={{ color: 'var(--fg-mute)', lineHeight: 1.8, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Acknowledgment of your grievance within 24 hours.</li>
              <li>Initial response with a reference number within 48 hours.</li>
              <li>Resolution or detailed update within 30 days of receipt.</li>
              <li>If unresolved, you may escalate to the relevant regulatory authority.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 10 }}>Regulatory Compliance</h2>
            <p style={{ color: 'var(--fg-mute)', lineHeight: 1.8 }}>This Grievance Officer is appointed in compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Digital Personal Data Protection Act, 2023. For data grievances under the DPDP Act 2023, you may also contact the Data Protection Board of India once operational.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
