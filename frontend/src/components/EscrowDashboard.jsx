import React, { useState } from 'react';
import { ArrowLeft, User, Shield, Coins, FileCheck, Landmark, AlertOctagon, CheckCircle } from 'lucide-react';

// SVG Circular Progress Ring
function ProgressRing({ percent, size = 80, stroke = 5 }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  const color = percent === 100 ? 'var(--neon-green)' : 'var(--neon-teal)';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none"
        stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s var(--ease-out-expo)', filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x="50%" y="50%" textAnchor="middle" dy=".35em"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', 
          fill: 'var(--text-bright)', fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        {percent}%
      </text>
    </svg>
  );
}

export default function EscrowDashboard({ gig, onBack, onFund, onSubmit, onRelease, onDispute, onHire, crewMembers, currentWallet }) {
  const [testRole, setTestRole] = useState('captain');
  const [selectedCrewId, setSelectedCrewId] = useState('');

  const totalMilestones = gig.milestones.length;
  const fundedMilestones = gig.milestones.filter(m => m.funded).length;
  const releasedMilestones = gig.milestones.filter(m => m.released).length;
  const disputedMilestones = gig.milestones.filter(m => m.disputed).length;

  const totalBudget = gig.budget;
  const lockedEscrow = gig.milestones.reduce((acc, m) => acc + (m.funded && !m.released ? m.amount : 0), 0);
  const totalReleased = gig.milestones.reduce((acc, m) => acc + (m.released ? m.amount : 0), 0);
  const progressPct = totalMilestones > 0 ? Math.round((releasedMilestones / totalMilestones) * 100) : 0;

  const handleHireSubmit = (e) => {
    e.preventDefault();
    if (!selectedCrewId) return;
    onHire(gig.id, selectedCrewId);
  };

  return (
    <div style={{ animation: 'fadeInUp .5s var(--ease-out-expo)' }}>
      <button onClick={onBack} className="btn-glass" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={14} /> Return to Mission Board
      </button>

      {/* Hero */}
      <div className="dashboard-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="hero-subtitle">CONTRACT ESCROW REGISTRY // GIG ID: #{gig.id}</span>
            <h1 style={{ fontSize: 'clamp(24px,4vw,36px)' }}>{gig.title}</h1>
          </div>
          {/* Role Toggle */}
          <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: 'var(--radius-md)' }}>
            <button onClick={() => setTestRole('captain')}
              className={`nav-item ${testRole === 'captain' ? 'active' : ''}`}
              style={{ fontSize: '10px', padding: '6px 14px', borderRadius: 'var(--radius-sm)' }}>
              <User size={11} /> Captain
            </button>
            <button onClick={() => setTestRole('crew')}
              className={`nav-item ${testRole === 'crew' ? 'active' : ''}`}
              style={{ fontSize: '10px', padding: '6px 14px', borderRadius: 'var(--radius-sm)' }}>
              <Shield size={11} /> Crew
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper stat-icon-teal"><Coins size={22} /></div>
          <div>
            <div className="stat-val">{totalBudget} <span style={{ fontSize: '14px', opacity: .6 }}>XCC</span></div>
            <div className="stat-lbl">Total Budget</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper stat-icon-purple"><Landmark size={22} /></div>
          <div>
            <div className="stat-val">{lockedEscrow} <span style={{ fontSize: '14px', opacity: .6 }}>XCC</span></div>
            <div className="stat-lbl">Locked In Escrow</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper stat-icon-gold"><FileCheck size={22} /></div>
          <div>
            <div className="stat-val">{totalReleased} <span style={{ fontSize: '14px', opacity: .6 }}>XCC</span></div>
            <div className="stat-lbl">Released to Crew</div>
          </div>
        </div>
      </div>

      <div className="escrow-layout">
        {/* Milestones Panel */}
        <div className="glass-panel escrow-main-panel">
          <h2 style={{ fontSize: '17px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Milestone Pipeline
            <span style={{ fontSize: '11px', color: 'var(--neon-teal)', fontWeight: 400, opacity: .7 }}>
              {releasedMilestones}/{totalMilestones}
            </span>
          </h2>

          {!gig.crew ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
              <h3 style={{ fontSize: '16px' }}>Crew Assignment Required</h3>
              <p style={{ maxWidth: '420px', margin: '8px auto 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Recruit a freelancer to lock milestones into the Soroban escrow.
              </p>
              
              {gig.applications.length > 0 ? (
                <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--neon-teal)', marginBottom: '12px', letterSpacing: '.08em' }}>PROPOSALS:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {gig.applications.map((app, idx) => {
                      const crew = crewMembers.find(c => c.id === app.crewId);
                      return (
                        <div key={idx} className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(155,81,224,.08)', border: '1px solid rgba(155,81,224,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                {crew?.avatar}
                              </div>
                              <div>
                                <strong style={{ fontSize: '13px', color: 'var(--text-bright)' }}>{crew?.name}</strong>
                                <div style={{ fontSize: '10px', color: 'var(--neon-teal)', letterSpacing: '.04em' }}>{crew?.species}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--star-gold)' }}>★ {crew?.rating}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px', fontStyle: 'italic' }}>
                            "{app.proposal}"
                          </p>
                          <button onClick={() => onHire(gig.id, crew.id)}
                            className="btn-neon-teal" style={{ padding: '7px 14px', fontSize: '11px' }}>
                            Accept & Assign Escrow
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>No proposals yet.</span>
                  <form onSubmit={handleHireSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '400px', width: '100%', marginTop: '8px' }}>
                    <select value={selectedCrewId} onChange={(e) => setSelectedCrewId(e.target.value)}
                      style={{ flex: 1, fontSize: '12px' }} required>
                      <option value="">Select Crew...</option>
                      {crewMembers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.avatar} {c.name} — {c.dailyRate} XCC/day
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-neon-teal" style={{ padding: '8px 16px', fontSize: '11px' }}>Contract</button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="milestones-timeline">
              {gig.milestones.map((milestone, idx) => {
                let statusLabel = "UNFUNDED";
                if (milestone.released) statusLabel = "RELEASED";
                else if (milestone.disputed) statusLabel = "DISPUTED";
                else if (milestone.submitted) statusLabel = "SUBMITTED";
                else if (milestone.funded) statusLabel = "ESCROW LOCKED";

                return (
                  <div key={idx}
                    className={`milestone-node ${milestone.funded ? 'funded' : ''} ${milestone.released ? 'released' : ''} ${milestone.disputed ? 'disputed' : ''}`}>
                    <div className="milestone-index">{idx + 1}</div>
                    <div className="milestone-details">
                      <span className="milestone-desc">{milestone.description}</span>
                      <span className="milestone-amount">{milestone.amount} XCC // {statusLabel}</span>
                    </div>
                    <div className="milestone-actions">
                      {testRole === 'captain' && (
                        <>
                          {!milestone.funded && (
                            <button onClick={() => onFund(gig.id, idx, milestone.amount)}
                              className="btn-neon-teal" style={{ padding: '6px 12px', fontSize: '10px' }}>
                              Fund Escrow
                            </button>
                          )}
                          {milestone.funded && !milestone.released && (
                            <button onClick={() => onRelease(gig.id, idx, milestone.amount)}
                              className="btn-neon-purple" style={{ padding: '6px 12px', fontSize: '10px' }}>
                              Release
                            </button>
                          )}
                        </>
                      )}
                      {testRole === 'crew' && (
                        <>
                          {milestone.funded && !milestone.submitted && !milestone.released && (
                            <button onClick={() => onSubmit(gig.id, idx)}
                              className="btn-neon-teal" style={{ padding: '6px 12px', fontSize: '10px' }}>
                              Submit Work
                            </button>
                          )}
                          {milestone.funded && milestone.submitted && !milestone.released && (
                            <span style={{ fontSize: '10px', color: 'var(--neon-teal)', fontFamily: 'var(--font-display)', border: '1px solid rgba(0,242,254,.15)', padding: '5px 10px', borderRadius: 'var(--radius-sm)', letterSpacing: '.04em' }}>
                              AWAITING APPROVAL
                            </span>
                          )}
                        </>
                      )}
                      {milestone.funded && !milestone.released && !milestone.disputed && (
                        <button onClick={() => onDispute(gig.id, idx)}
                          className="btn-danger" style={{ padding: '6px 10px' }} title="Raise Dispute">
                          <AlertOctagon size={12} />
                        </button>
                      )}
                      {milestone.released && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--neon-green)', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.04em' }}>
                          <CheckCircle size={12} /> PAID
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="glass-panel escrow-summary-panel">
          <h2 style={{ fontSize: '15px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
            Mission Registry
          </h2>

          {/* Progress Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <ProgressRing percent={progressPct} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '.06em', textTransform: 'uppercase' }}>CAPTAIN WALLET</span>
              <code style={{ fontSize: '10px', wordBreak: 'break-all' }}>{gig.captain}</code>
            </div>

            <div>
              <span style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '.06em', textTransform: 'uppercase' }}>CREW MEMBER</span>
              {gig.crew ? (
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,.02)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(155,81,224,.08)', border: '1px solid rgba(155,81,224,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                    {gig.crew.avatar}
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-bright)', fontSize: '13px' }}>{gig.crew.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--neon-teal)', letterSpacing: '.04em' }}>{gig.crew.species}</span>
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--neon-pink)', fontSize: '12px' }}>UNASSIGNED</span>
              )}
            </div>

            {gig.crew && (
              <div>
                <span style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '.06em', textTransform: 'uppercase' }}>PAYOUT WALLET</span>
                <code style={{ fontSize: '10px', wordBreak: 'break-all' }}>{gig.crew.wallet}</code>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                ['Status', gig.status.toUpperCase(), gig.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-teal)'],
                ['Milestones', totalMilestones],
                ['Funded', fundedMilestones],
                ['Released', releasedMilestones],
              ].map(([label, val, color], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ color: color || 'var(--text-primary)', fontWeight: 600 }}>{val}</span>
                </div>
              ))}
              {disputedMilestones > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neon-pink)', fontSize: '12px' }}>
                  <span>Disputes</span><span>{disputedMilestones}</span>
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '12px', background: 'rgba(0,242,254,.02)', border: '1px solid rgba(0,242,254,.08)', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
              <span style={{ fontSize: '10px', color: 'var(--neon-teal)', fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '.05em' }}>
                <Shield size={11} /> SOROBAN SECURED
              </span>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.5 }}>
                Funds locked in smart contract <code style={{ fontSize: '9px' }}>CDGIGNEX...GIGX</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
