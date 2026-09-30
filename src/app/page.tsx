'use client';

import ApprovalsPanel from '@/components/ApprovalsPanel';

export default function Home() {
  return (
    <main className="dashboard-container">
      {/* Background or underlying dashboard could go here */}
      <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
        <h1>OomniEye Dashboard</h1>
        <p>Main interface underneath the assistant panel.</p>
      </div>

      <ApprovalsPanel />
    </main>
  );
}
