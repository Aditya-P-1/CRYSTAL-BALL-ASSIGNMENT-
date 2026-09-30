import React from 'react';
import { useChatStore } from '@/store/useChatStore';

export default function ApprovalsPanel() {
  const { messages, isLoading, error } = useChatStore();

  return (
    <div className="approvals-panel">
      <h2>Approvals</h2>
      
      {isLoading && <div data-testid="loading-indicator">Loading...</div>}
      
      {error && <div className="error">{error}</div>}
      
      <div className="actions">
        <button>Present me Summary</button>
        <button>Talk to me</button>
        <button>Help me</button>
        <button>Teach me</button>
        <button>Replay Greeting</button>
      </div>
    </div>
  );
}
