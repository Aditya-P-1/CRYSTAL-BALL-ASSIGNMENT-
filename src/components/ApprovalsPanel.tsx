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
          <div className="avatar">O</div>
          <div>
            <h3>OomniEye Assistant</h3>
            <span className="status">Online</span>
          </div>
        </div>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="panel-content">
        
        {/* Default Actions (only show if no chat history or summary) */}
        {messages.length === 0 && !summaryData && (
          <div className="action-cards">
            <button className="action-card" onClick={() => handleAction('summary')}>
              <Play size={18} />
              <span>Present me Summary</span>
            </button>
            <button className="action-card" onClick={() => handleAction('chat')}>
              <MessageSquare size={18} />
              <span>Talk to me</span>
            </button>
            <button className="action-card" onClick={() => handleAction('help')}>
              <HelpCircle size={18} />
              <span>Help me</span>
            </button>
            <button className="action-card" onClick={() => handleAction('teach')}>
              <BookOpen size={18} />
              <span>Teach me</span>
            </button>
            <button className="action-card" onClick={() => handleAction('greeting')}>
              <RotateCcw size={18} />
              <span>Replay Greeting</span>
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
    </div>
  );
}
