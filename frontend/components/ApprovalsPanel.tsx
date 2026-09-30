import React, { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { X, Play, MessageSquare, HelpCircle, BookOpen, RotateCcw } from 'lucide-react';

export default function ApprovalsPanel() {
  const { messages, isLoading, error, summaryData, triggerAction, resetChat } = useChatStore();
  const [isOpen, setIsOpen] = useState(true);
  const [inputText, setInputText] = useState('');

  if (!isOpen) {
    return (
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  const handleAction = (action: string) => {
    resetChat();
    triggerAction(action);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Determine context based on what we are doing, but default to 'chat'
    triggerAction('chat', inputText);
    setInputText('');
  };

  return (
    <div className="approvals-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="avatar-section">
          <div className="avatar-circle">
             <img src="/talk.png" alt="Avatar" className="header-avatar-img" />
          </div>
          <h3 className="header-title">Approvals</h3>
        </div>
        <div className="header-icons">
          <span className="icon">ⓘ</span>
          <span className="icon">⤢</span>
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>
      </div>

      <div className="panel-subheader">
        <div className="sub-left">
          <span className="home-icon">⌂</span> Approvals
        </div>
        <button className="replay-greeting-btn" onClick={() => handleAction('greeting')}>
          Replay Greeting
        </button>
      </div>

      {/* Main Content Area */}
      <div className="panel-content">
        
        {/* Default Actions (only show if no chat history or summary) */}
        {messages.length === 0 && !summaryData && (
          <div className="action-grid">
            <button className="action-card-grid" onClick={() => handleAction('summary')}>
              <img src="/summary.png" alt="Summary" />
              <span>Present me Summary</span>
            </button>
            <button className="action-card-grid" onClick={() => handleAction('chat')}>
              <img src="/talk.png" alt="Talk" />
              <span>Talk to me</span>
            </button>
            <button className="action-card-grid" onClick={() => handleAction('help')}>
              <img src="/help.png" alt="Help" />
              <span>Help me</span>
            </button>
            <button className="action-card-grid" onClick={() => handleAction('teach')}>
              <img src="/teach.png" alt="Teach" />
              <span>Teach me</span>
            </button>
          </div>
        )}

        {/* Loading and Error States */}
        {isLoading && <div className="loading" data-testid="loading-indicator">
          <div className="spinner"></div> Assistant is thinking...
        </div>}
        
        {error && <div className="error">
          <strong>Error:</strong> {error}
        </div>}

        {/* Summary Output */}
        {summaryData && (
          <div className="summary-box">
            <h4>Queue Summary</h4>
            <p>{summaryData.summary}</p>
            <h5>Urgent Items:</h5>
            <ul>
              {summaryData.urgentItems.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="recommended">
              <strong>Recommended Action:</strong> {summaryData.recommendedAction}
            </div>
            <button className="clear-btn" onClick={resetChat}>Start Over</button>
          </div>
        )}

        {/* Chat History */}
        {messages.length > 0 && (
          <div className="chat-history">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      {(messages.length > 0 || summaryData) && (
        <form className="chat-input" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type your question..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputText.trim()}>Send</button>
        </form>
      )}

      {/* Footer */}
      <div className="panel-footer">
        <span className="footer-left">26 folders / items</span>
        <a href="#" className="footer-link">HMS Panel ↗</a>
      </div>
    </div>
  );
}
