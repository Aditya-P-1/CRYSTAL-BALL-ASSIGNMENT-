import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { X, Play, MessageSquare, HelpCircle, BookOpen, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ApprovalsPanel() {
  const { messages, isLoading, error, summaryData, triggerAction, resetChat } = useChatStore();
  const [isOpen, setIsOpen] = useState(true);
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentEndRef.current && typeof contentEndRef.current.scrollIntoView === 'function') {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, error, summaryData, isLoading]);

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

    triggerAction('chat', inputText);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isLoading) {
        handleSend(e);
      }
    }
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
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>
      </div>

      <div className="panel-subheader">
        <div className="sub-left" style={{ display: 'flex', alignItems: 'center' }}>
          {(messages.length > 0 || summaryData) ? (
            <button
              onClick={resetChat}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '500' }}
            >
              <span style={{ marginRight: '6px', fontSize: '16px' }}>←</span> Back
            </button>
          ) : (
            <><span className="home-icon">⌂</span> Approvals</>
          )}
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
        {isLoading && messages.length === 0 && (
          <div className="loading" data-testid="loading-indicator">
            <div className="spinner"></div> Assistant is thinking...
          </div>
        )}

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
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1;
              const isStreamingThis = isLast && msg.role === 'assistant' && isLoading;
              return (
                <div key={msg.id} className={`message ${msg.role}`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {isStreamingThis && (
                        <span className="typing-dots" aria-label="AI is typing">
                          <span />
                          <span />
                          <span />
                        </span>
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div ref={contentEndRef} />
      </div>

      {/* Input Area */}
      {(messages.length > 0 || summaryData) && (
        <form className="chat-input" onSubmit={handleSend}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type your question..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputText.trim()}>Send</button>
        </form>
      )}


    </div>
  );
}
