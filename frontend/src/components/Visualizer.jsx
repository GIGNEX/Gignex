import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap } from 'lucide-react';

export default function Visualizer({ active, amount, fromNode, toNode, onComplete }) {
  const canvasRef = useRef(null);
  const [txLog, setTxLog] = useState([]);
  const [percent, setPercent] = useState(0);
  const [displayedAmount, setDisplayedAmount] = useState(0);

  // Animated counter for amount
  useEffect(() => {
    if (!active) { setDisplayedAmount(0); return; }
    let current = 0;
    const step = amount / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= amount) { setDisplayedAmount(amount); clearInterval(interval); }
      else setDisplayedAmount(Math.floor(current));
    }, 50);
    return () => clearInterval(interval);
  }, [active, amount]);

  useEffect(() => {
    if (!active) { setTxLog([]); setPercent(0); return; }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Typewriter log entries
    const logs = [
      `[SYS] Initiating cryptographic channel...`,
      `[LEDGER] Querying smart contract CDGIGNEXESCROW...`,
      `[AUTH] Signatures verified. Stardust flow ready.`,
      `[FLOW] Locking ${amount} XCC in Soroban Escrow...`,
      `[TX] Broadcasting to Stellar validators...`,
      `[NET] Block validated! Hash: 0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      `[SUCCESS] Credits streamed successfully!`
    ];

    let currentLogIdx = 0;
    const logInterval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setTxLog(prev => [...prev, logs[currentLogIdx]]);
        currentLogIdx++;
      }
    }, 500);

    // Particles
    const particles = [];
    const count = 100;
    const startX = window.innerWidth * 0.25;
    const startY = window.innerHeight * 0.5;
    const endX = window.innerWidth * 0.75;
    const endY = window.innerHeight * 0.5;
    const ctrlX = (startX + endX) / 2;
    const ctrlY = Math.min(startY, endY) - 160;

    const bezier = (t, p0, p1, p2) => ({
      x: (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x,
      y: (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y
    });

    for (let i = 0; i < count; i++) {
      const isTeal = Math.random() > 0.35;
      particles.push({
        t: -Math.random() * 0.5,
        speed: 0.006 + Math.random() * 0.012,
        size: 1 + Math.random() * 3,
        color: isTeal ? '#00f2fe' : '#9b51e0',
        glow: isTeal ? 'rgba(0,242,254,' : 'rgba(155,81,224,',
        wiggle: Math.random() * 15 - 7.5,
        trail: []
      });
    }

    let progress = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Path
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.strokeStyle = 'rgba(0,242,254,.04)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 12]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nodes
      const drawNode = (x, y, label, col) => {
        // Outer ring
        const t = Date.now() / 1000;
        const pulseR = 50 + Math.sin(t * 2) * 8;
        const grad = ctx.createRadialGradient(x, y, 2, x, y, pulseR);
        grad.addColorStop(0, col + '0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, pulseR, 0, Math.PI * 2);
        ctx.fill();
        // Inner ring
        ctx.strokeStyle = col + '0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.stroke();
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 6);
      };

      drawNode(startX, startY, 'CAPTAIN', 'rgba(0,242,254,');
      drawNode(endX, endY, 'ESCROW VAULT', 'rgba(155,81,224,');

      // Particles with trails
      let finishedCount = 0;
      particles.forEach(p => {
        if (p.t < 0) { p.t += 0.004; return; }
        if (p.t >= 1) { finishedCount++; if (progress < 1) p.t = 0; return; }
        p.t += p.speed;

        const pt = bezier(p.t, {x:startX,y:startY}, {x:ctrlX,y:ctrlY}, {x:endX,y:endY});
        const wx = p.wiggle * Math.sin(p.t * Math.PI * 4);
        const wy = p.wiggle * Math.cos(p.t * Math.PI * 4);
        const px = pt.x + wx;
        const py = pt.y + wy;

        // Store trail
        p.trail.push({x: px, y: py});
        if (p.trail.length > 6) p.trail.shift();

        // Draw trail
        for (let i = 0; i < p.trail.length - 1; i++) {
          const alpha = (i / p.trail.length) * 0.3;
          ctx.fillStyle = p.glow + alpha + ')';
          const trailSize = p.size * (i / p.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(p.trail[i].x, p.trail[i].y, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw particle
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      progress += 0.004;
      setPercent(Math.min(Math.floor(progress * 100), 100));

      if (progress >= 1 && finishedCount === particles.length) {
        clearInterval(logInterval);
        setTimeout(() => onComplete(), 800);
      } else {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => { cancelAnimationFrame(animationId); clearInterval(logInterval); };
  }, [active, amount, fromNode, toNode]);

  if (!active) return null;

  return (
    <div className="visualizer-overlay" style={{ 
      background: 'rgba(4,6,11,.9)', backdropFilter: 'blur(12px)', 
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' 
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      <div className="glass-panel" style={{ 
        width: '90%', maxWidth: '560px', padding: '32px', 
        border: '1px solid rgba(0,242,254,.2)', 
        boxShadow: '0 0 40px rgba(0,242,254,.15), 0 0 80px rgba(0,242,254,.05)', 
        position: 'relative', zIndex: 10 
      }}>
        {/* Scanner line */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'rgba(0,242,254,.3)', boxShadow: '0 0 8px rgba(0,242,254,.4)', animation: 'scanning 3s linear infinite', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap style={{ color: 'var(--neon-teal)', animation: 'spin-slow 2s linear infinite' }} size={20} />
            <h2 style={{ fontSize: '16px', margin: 0, letterSpacing: '.06em' }}>SOROBAN TRANSACTOR</h2>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--neon-green)', letterSpacing: '.06em' }}>
            ● STABLE
          </span>
        </div>

        {/* Amount */}
        <div className="glass-panel" style={{ background: 'rgba(0,0,0,.4)', padding: '18px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em' }}>STREAMING ENERGY</span>
          <h1 style={{ fontSize: '30px', color: 'var(--neon-teal)', margin: '4px 0', textShadow: '0 0 20px rgba(0,242,254,.3)' }}>
            {displayedAmount} XCC
          </h1>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '.1em' }}>ESCROW BLOCKCHAIN STATE</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '6px', letterSpacing: '.05em' }}>
            <span>TRANSMITTING</span>
            <span style={{ color: percent === 100 ? 'var(--neon-green)' : 'var(--neon-teal)' }}>{percent}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,.04)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', width: `${percent}%`, 
              background: 'var(--gradient-aurora)', backgroundSize: '200% 100%',
              animation: 'gradientShift 2s ease infinite',
              boxShadow: '0 0 10px rgba(0,242,254,.3)',
              transition: 'width .15s linear', borderRadius: 'var(--radius-full)' 
            }} />
          </div>
        </div>

        {/* Console */}
        <div className="glass-panel" style={{ 
          background: 'rgba(4,6,11,.95)', padding: '12px', borderRadius: 'var(--radius-sm)', 
          height: '140px', overflowY: 'auto', border: '1px solid var(--border-subtle)', 
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', 
          display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' 
        }}>
          {txLog.map((log, idx) => {
            let color = 'var(--text-muted)';
            if (log.startsWith('[SYS]')) color = 'var(--neon-teal)';
            if (log.startsWith('[SUCCESS]')) color = 'var(--neon-green)';
            if (log.startsWith('[FLOW]')) color = 'var(--neon-purple)';
            return <div key={idx} style={{ color, animation: 'fadeIn .3s ease' }}>{log}</div>;
          })}
          <span style={{ animation: 'pulse-dot 1s infinite', display: 'inline-block', width: '6px', height: '12px', background: 'var(--neon-teal)', borderRadius: '1px', marginTop: '2px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '18px', gap: '6px' }}>
          <Shield size={11} style={{ color: 'var(--neon-teal)', opacity: .6 }} />
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '.04em' }}>
            Secured by Stellar Soroban VM
          </span>
        </div>
      </div>
    </div>
  );
}
