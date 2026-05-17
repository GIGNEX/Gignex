import React from 'react';

const LoadingScreen = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-void)',
      backdropFilter: 'blur(4px)',
      gap: '16px'
    }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(0, 242, 254, 0.2)',
          borderTopColor: 'var(--neon-teal)',
          borderRadius: '50%',
          animation: 'spin-slow 1s linear infinite'
        }}
      />
      <span style={{
        fontFamily: 'var(--font-cyber)',
        fontSize: '12px',
        letterSpacing: '0.1em',
        color: 'var(--neon-teal)'
      }}>
        BOOTING GIGNEX HUD REGISTRY...
      </span>
    </div>
  );
};

export default LoadingScreen;
