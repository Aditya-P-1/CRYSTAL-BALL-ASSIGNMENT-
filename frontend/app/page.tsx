'use client';

import React, { useState } from 'react';
import ApprovalsPanel from '@/components/ApprovalsPanel';
import { Folder, Video, FileText, Image as ImageIcon, MoreVertical, Search, ArrowLeft, RotateCcw, MessageSquare, Settings, Bell, LayoutGrid, List, ChevronDown } from 'lucide-react';
import approvalsRaw from '../../backend/data/approvals.json';

const MOCK_DATA = approvalsRaw.map((item: any) => ({
  title: item.Item,
  subtitle: item.Type === 'Folder' ? 'My Site Patrol > My Site Patrol Card' : item.Type === 'Video' ? 'Drawing-Videos > Drawing-Videos Card' : 'Site Recordings > Site Recordings',
  type: item.Type,
  submitter: item["Submitted by"],
  date: item.Status.split(' — ')[1] || 'Sep 18',
  status: item.Status.split(' — ')[0] || 'Pending Review'
}));

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'queue' | 'hierarchy'>('queue');

  const filteredData = MOCK_DATA.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.submitter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group data by category for hierarchy view
  const groupedData = filteredData.reduce((acc, item) => {
    const category = item.subtitle.split(' > ')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof MOCK_DATA>);

  return (
    <main className="dashboard-container" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      <style>{`
        .table-row:hover { background-color: #f8fafc; cursor: pointer; }
        .icon-btn:hover { color: #1e293b; background: #f1f5f9; border-radius: 8px; }
        .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .hierarchy-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
      `}</style>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>OomniEye</h1>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>DIGITAL TWIN SOLUTIONS</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', color: '#64748b' }}>
          <RotateCcw size={20} className="icon-btn" style={{ padding: '4px', cursor: 'pointer' }} />
          <MessageSquare size={20} className="icon-btn" style={{ padding: '4px', cursor: 'pointer' }} />
          <Settings size={20} className="icon-btn" style={{ padding: '4px', cursor: 'pointer' }} />
          <Bell size={20} className="icon-btn" style={{ padding: '4px', cursor: 'pointer' }} />
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}>R</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, padding: '32px', gap: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          
          {/* Sub Header (Breadcrumb & Search) */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Approvals & Review ⓘ</h2>
          </div>

          <div style={{ marginBottom: '32px', position: 'relative', width: '100%', maxWidth: '600px' }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search approvals by title, author, folder, or page..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', color: '#1e293b', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} 
            />
          </div>

          {/* Approvals Section */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div className="approvals-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', alignItems: 'center', background: '#fafaf9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <List size={20} color="#8b5cf6" />
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#334155', letterSpacing: '0.5px' }}>PENDING APPROVAL REQUESTS</h3>
                <span style={{ background: '#e0e7ff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, color: '#4338ca' }}>{filteredData.length} items</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button 
                  onClick={() => setViewMode('queue')}
                  style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', background: viewMode === 'queue' ? 'white' : 'transparent', fontSize: '0.85rem', fontWeight: viewMode === 'queue' ? 600 : 500, color: viewMode === 'queue' ? '#0f172a' : '#64748b', boxShadow: viewMode === 'queue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <List size={16}/> Queue View
                </button>
                <button 
                  onClick={() => setViewMode('hierarchy')}
                  style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', background: viewMode === 'hierarchy' ? 'white' : 'transparent', fontSize: '0.85rem', fontWeight: viewMode === 'hierarchy' ? 600 : 500, color: viewMode === 'hierarchy' ? '#0f172a' : '#64748b', boxShadow: viewMode === 'hierarchy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <LayoutGrid size={16}/> Hierarchy
                </button>
              </div>
            </div>

            {viewMode === 'queue' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'white', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '45%' }}>FOLDER / CONTENT NAME</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>TYPE</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>SUBMITTED BY</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>DATE</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>STATUS</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No items found matching your search.</td></tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className="table-row" style={{ borderBottom: idx !== filteredData.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }}>
                        <td data-label="FOLDER / CONTENT NAME" style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{ color: item.type === 'Folder' ? '#f59e0b' : item.type === 'Video' ? '#ef4444' : item.type === 'PDF' ? '#3b82f6' : '#10b981', background: item.type === 'Folder' ? '#fef3c7' : item.type === 'Video' ? '#fee2e2' : item.type === 'PDF' ? '#dbeafe' : '#d1fae5', padding: '10px', borderRadius: '10px' }}>
                            {item.type === 'Folder' ? <Folder size={20} /> : item.type === 'Video' ? <Video size={20} /> : item.type === 'PDF' ? <FileText size={20} /> : <ImageIcon size={20} />}
                          </div>
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px' }}>{item.subtitle}</div>
                          </div>
                        </td>
                        <td data-label="TYPE" style={{ padding: '20px 24px' }}>
                          <span style={{ border: '1px solid #e2e8f0', background: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                            {item.type === 'Folder' ? <Folder size={14} color="#94a3b8" /> : item.type === 'Video' ? <Video size={14} color="#94a3b8" /> : item.type === 'PDF' ? <FileText size={14} color="#94a3b8" /> : <ImageIcon size={14} color="#94a3b8" />} {item.type}
                          </span>
                        </td>
                        <td data-label="SUBMITTED BY" style={{ padding: '20px 24px', color: '#475569', fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.submitter}</td>
                        <td data-label="DATE" style={{ padding: '20px 24px', color: '#64748b', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{item.date}</td>
                        <td data-label="STATUS" style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>
                            {item.status}
                          </span>
                        </td>
                        <td data-label="ACTION" style={{ padding: '20px 24px', color: '#cbd5e1', textAlign: 'right' }}>
                          <MoreVertical size={20} style={{ cursor: 'pointer' }} className="icon-btn" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px', background: '#fafaf9' }}>
                {Object.keys(groupedData).length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>No items found matching your search.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.entries(groupedData).map(([category, items]) => (
                      <div key={category} style={{ position: 'relative' }}>
                        {/* Parent Node */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', userSelect: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', position: 'relative', zIndex: 2 }}>
                          <ChevronDown size={18} color="#64748b" />
                          <Folder size={18} color="#8b5cf6" fill="#ede9fe" />
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{category}</h4>
                          <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px', fontWeight: 600, marginLeft: 'auto' }}>{items.length} items</span>
                        </div>
                        
                        {/* Children Nodes */}
                        <div style={{ paddingLeft: '34px', position: 'relative', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Vertical Connector Line */}
                          <div style={{ position: 'absolute', left: '24px', top: '-10px', bottom: '24px', width: '2px', background: '#cbd5e1', borderRadius: '2px', zIndex: 1 }}></div>
                          
                          {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', position: 'relative', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', zIndex: 2 }} className="tree-child-card">
                              {/* Horizontal Connector Line */}
                              <div style={{ position: 'absolute', left: '-10px', top: '50%', width: '10px', height: '2px', background: '#cbd5e1', zIndex: 1 }}></div>
                              
                              <div style={{ color: item.type === 'Folder' ? '#f59e0b' : item.type === 'Video' ? '#ef4444' : item.type === 'PDF' ? '#3b82f6' : '#10b981', background: item.type === 'Folder' ? '#fef3c7' : item.type === 'Video' ? '#fee2e2' : item.type === 'PDF' ? '#dbeafe' : '#d1fae5', padding: '10px', borderRadius: '10px' }}>
                                {item.type === 'Folder' ? <Folder size={18} /> : item.type === 'Video' ? <Video size={18} /> : item.type === 'PDF' ? <FileText size={18} /> : <ImageIcon size={18} />}
                              </div>
                              
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>{item.subtitle.split(' > ')[1] || item.subtitle}</div>
                              </div>

                              <div style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500, width: '150px' }}>{item.submitter}</div>
                              <div style={{ color: '#64748b', fontSize: '0.85rem', width: '80px' }}>{item.date}</div>
                              
                              <div style={{ width: '130px', textAlign: 'right' }}>
                                <span style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Placeholder for right-side so the chat widget has space to sit */}
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div style={{ padding: '8px', display: 'flex', justifyContent: 'flex-end' }}>
             {/* Add help button removed per user request */}
           </div>
        </div>
      </div>

      <ApprovalsPanel />
    </main>
  );
}
