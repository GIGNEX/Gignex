import React, { useState, useEffect } from 'react';
import { Compass, PlusSquare, LayoutDashboard, Wallet, Cpu, CheckCircle, Activity, Zap, Globe } from 'lucide-react';

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  walletAddress, 
  connectWallet, 
  walletInstalled, 
  balance 
}) {
  const truncatedWallet = walletAddress 
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
    : 'Not Connected';

  // Live ticker simulation
  const [blockHeight, setBlockHeight] = useState(4827391);
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + Math.floor(Math.random() * 3));
      setLatency(Math.floor(30 + Math.random() * 25));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Animated Starfield Background */}
      <div className="starfield-overlay">
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
      </div>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand-section">
            <span className="brand-logo-icon">🪐</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand-logo">GIGNEX</span>
              <span className="system-status">
                <span className="status-dot"></span>
                SECTOR-X7 TESTNET // ONLINE
              </span>
            </div>
          </div>

          <nav className="nav-links">
            <button 
              className={`nav-item ${activeTab === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActiveTab('marketplace')}
            >
              <Compass size={15} />
              Marketplace
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'post-gig' ? 'active' : ''}`}
              onClick={() => setActiveTab('post-gig')}
            >
              <PlusSquare size={15} />
              Post Gig
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>
          </nav>

          <div className="wallet-section">
            {/* Live Network Ticker */}
            <div className="glass-panel" style={{ 
              display: 'flex', alignItems: 'center', gap: '14px', 
              padding: '7px 14px', borderRadius: 'var(--radius-md)',
              fontSize: '10px', fontFamily: 'var(--font-display)',
              color: 'var(--text-muted)', letterSpacing: '.04em'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={10} style={{ color: 'var(--neon-green)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{blockHeight.toLocaleString()}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={10} style={{ color: 'var(--star-gold)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{latency}ms</span>
              </span>
            </div>

            {/* Balance Display */}
            <div className="glass-panel" style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              padding: '7px 14px', borderRadius: 'var(--radius-md)' 
            }}>
              <Wallet size={15} style={{ color: 'var(--neon-teal)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ 
                  fontSize: '12px', fontWeight: '700', color: 'var(--text-bright)', 
                  fontFamily: 'var(--font-display)' 
                }}>
                  {balance.toLocaleString()} XCC
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '.05em' }}>
                  Cosmic Credits
                </span>
              </div>
            </div>

            {/* Wallet Button */}
            {walletAddress ? (
              <div className="btn-neon-teal" style={{ padding: '8px 14px', fontSize: '11px', cursor: 'default' }}>
                <CheckCircle size={13} />
                {truncatedWallet}
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-neon-purple" style={{ padding: '9px 18px', fontSize: '11px' }}>
                <Cpu size={13} />
                Connect Cockpit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Globe size={12} style={{ color: 'var(--neon-teal)', opacity: 0.5 }} />
          <span>GIGNEX PROTOCOL © 2026</span>
          <span style={{ color: 'var(--border-glass)' }}>|</span>
          <span>DECENTRALIZED ESCROW SERVICES</span>
          <span style={{ color: 'var(--border-glass)' }}>|</span>
          <span style={{ color: 'var(--neon-teal)', opacity: 0.6 }}>V2.0.0-SOROBAN</span>
        </div>
      </footer>
    </div>
  );
}
