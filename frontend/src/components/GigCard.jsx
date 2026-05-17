import React, { useState } from 'react';
import { Send, ChevronRight, Award, AlertTriangle, CheckCircle } from 'lucide-react';

export default function GigCard({ gig, onApply, onManage, currentWallet }) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [applied, setApplied] = useState(false);

  const isCaptain = gig.captain === currentWallet;

  // Calculate milestone progress
  const totalMs = gig.milestones?.length || 0;
  const completedMs = gig.milestones?.filter(m => m.released).length || 0;
  const progressPct = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

  const getStatusBadge = (status) => {
    const badges = {
      open:      <span className="status-badge badge-open">📡 OPEN MISSION</span>,
      active:    <span className="status-badge badge-active">🔮 ESCROW ACTIVE</span>,
      completed: <span className="status-badge badge-completed">✅ COMPLETED</span>,
      disputed:  <span className="status-badge badge-disputed">⚠️ DISPUTE</span>,
    };
    return badges[status] || <span className="status-badge badge-open">{status}</span>;
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!proposalText.trim()) return;
    onApply(gig.id, proposalText);
    setApplied(true);
    setProposalText('');
    setTimeout(() => { setShowApplyForm(false); setApplied(false); }, 2000);
  };

  return (
    <div className={`glass-panel gig-card ${gig.status}`}>
      {/* Header */}
      <div className="gig-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {getStatusBadge(gig.status)}
          <h3 className="gig-title" style={{ marginTop: '6px' }}>{gig.title}</h3>
        </div>
        <span className="gig-budget-tag">{gig.budget} XCC</span>
      </div>

      <p className="gig-desc">{gig.description}</p>

      {/* Skills */}
      <div className="gig-skills">
        {gig.requiredSkills.map((skill, idx) => (
          <span key={idx} className="skill-tag">🚀 {skill}</span>
        ))}
      </div>

      {/* Milestone Progress Bar */}
      {gig.status !== 'open' && totalMs > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', 
            fontSize: '10px', fontFamily: 'var(--font-display)', 
            color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '.05em' 
          }}>
            <span>MILESTONES</span>
            <span style={{ color: progressPct === 100 ? 'var(--neon-green)' : 'var(--neon-teal)' }}>
              {completedMs}/{totalMs}
            </span>
          </div>
          <div style={{ 
            height: '4px', background: 'rgba(255,255,255,.06)', 
            borderRadius: 'var(--radius-full)', overflow: 'hidden' 
          }}>
            <div style={{ 
              height: '100%', width: `${progressPct}%`,
              background: progressPct === 100 
                ? 'linear-gradient(90deg, var(--neon-green), #27ae60)' 
                : 'var(--gradient-aurora)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
              borderRadius: 'var(--radius-full)',
              transition: 'width .6s var(--ease-out-expo)',
              boxShadow: progressPct === 100 
                ? '0 0 10px rgba(0,230,118,.3)' 
                : '0 0 10px rgba(0,242,254,.2)'
            }}></div>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="gig-meta">
        <span className="species-requirement">
          👽 Pref: <strong style={{ color: 'var(--neon-teal)', marginLeft: '4px' }}>{gig.speciesPref}</strong>
        </span>
        {gig.crew ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: 'rgba(155,81,224,.1)', border: '1px solid rgba(155,81,224,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              boxShadow: 'inset 0 0 8px rgba(155,81,224,.1)'
            }}>
              {gig.crew.avatar}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-bright)' }}>{gig.crew.name}</span>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '.05em', textTransform: 'uppercase' }}>Assigned</span>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>Unassigned</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {gig.status === 'open' && !isCaptain && !showApplyForm && (
          <button 
            onClick={() => setShowApplyForm(true)} 
            className="btn-neon-teal"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Apply for Mission
            <ChevronRight size={15} />
          </button>
        )}

        {showApplyForm && (
          <form onSubmit={handleApplySubmit} className="glass-panel" style={{ 
            padding: '14px', background: 'rgba(4,6,11,.9)', 
            display: 'flex', flexDirection: 'column', gap: '10px', 
            border: '1px solid rgba(0,242,254,.25)' 
          }}>
            {applied ? (
              <div style={{ 
                textAlign: 'center', color: 'var(--neon-teal)', padding: '12px 0', 
                fontSize: '12px', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', gap: '6px' 
              }}>
                <CheckCircle size={20} />
                <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '.05em' }}>
                  Proposal Transmitted
                </span>
              </div>
            ) : (
              <>
                <textarea 
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder="Draft proposal: state your delivery time, skills, and credentials..."
                  rows={3}
                  style={{ fontSize: '12px', resize: 'none' }}
                  required
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowApplyForm(false)} className="btn-glass" style={{ padding: '7px 14px', fontSize: '11px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-neon-teal" style={{ padding: '7px 14px', fontSize: '11px' }}>
                    <Send size={11} /> Transmit
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {(gig.status === 'active' || gig.status === 'disputed' || (gig.status === 'open' && isCaptain)) && (
          <button 
            onClick={() => onManage(gig.id)} 
            className="btn-neon-purple"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Manage Escrow Core
            <ChevronRight size={15} />
          </button>
        )}

        {gig.status === 'completed' && (
          <div style={{ 
            padding: '12px', background: 'rgba(0,230,118,.04)', 
            border: '1px solid rgba(0,230,118,.2)', borderRadius: 'var(--radius-md)', 
            display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', 
            color: 'var(--neon-green)', fontSize: '12px', 
            fontFamily: 'var(--font-display)', fontWeight: '700', letterSpacing: '.05em' 
          }}>
            <Award size={16} />
            MISSION RESOLVED
          </div>
        )}
      </div>
    </div>
  );
}
