import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';

// ... (rest of imports remain unchanged)
import Layout from './components/Layout';
import GigCard from './components/GigCard';
import EscrowDashboard from './components/EscrowDashboard';
import Visualizer from './components/Visualizer';
import { 
  getWalletAddress, 
  checkFreighterInstalled, 
  sorobanCreateGig, 
  sorobanFundMilestone, 
  sorobanSubmitMilestone, 
  sorobanReleaseMilestone, 
  sorobanDisputeMilestone 
} from './utils/stellar';
import { Shield, Rocket, Plus, Trash2, CheckCircle2, User, Search } from 'lucide-react';
import './App.css';

const BACKEND_URL = 'http://localhost:3001/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedGigId, setSelectedGigId] = useState(null);
  
  // App databases
  const [gigs, setGigs] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Wallet states
  const [walletAddress, setWalletAddress] = useState('');
  const [walletInstalled, setWalletInstalled] = useState(false);
  const [balance, setBalance] = useState(5000); // Simulated Captain XCC balance

  // Visualizer states
  const [visualizerActive, setVisualizerActive] = useState(false);
  const [visualizerAmount, setVisualizerAmount] = useState(0);
  const [visualizerCallback, setVisualizerCallback] = useState(null);

  // Form states for creating a gig
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBudget, setFormBudget] = useState(500);
  const [formSpecies, setFormSpecies] = useState('Any');
  const [formSkills, setFormSkills] = useState('');
  const [formMilestones, setFormMilestones] = useState([
    { description: 'Initial Alpha wireframes', amount: 150 },
    { description: 'Final release and tests', amount: 350 }
  ]);
  const [formSuccess, setFormSuccess] = useState(false);

  // Fetch initial datasets from Backend API (with local fallback)
  useEffect(() => {
    async function fetchData() {
      try {
        const crewRes = await fetch(`${BACKEND_URL}/crew`);
        const gigsRes = await fetch(`${BACKEND_URL}/gigs`);
        
        if (crewRes.ok && gigsRes.ok) {
          const crewData = await crewRes.json();
          const gigsData = await gigsRes.json();
          setCrewMembers(crewData);
          setGigs(gigsData);
          console.log("🌌 Gignex Indexer connected. Datasets synced.");
        } else {
          throw new Error("Backend response error");
        }
      } catch (err) {
        console.warn("Express backend offline. Running Gignex in sandbox local mode.", err);
        // Load default static mock dataset
        const mockCrew = [
          {
            id: 1,
            name: "Xanthor Vex",
            species: "Cyborg-Krylon",
            avatar: "🤖",
            skills: ["Hyperdrive Engineering", "Quantum Assembly", "Fusion Shielding"],
            completedGigs: 42,
            rating: 4.9,
            dailyRate: 150,
            wallet: "GCYBORG574J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43EXY3"
          },
          {
            id: 2,
            name: "Lira Starweaver",
            species: "Pleiadian Holo-Elf",
            avatar: "🧝‍♀️",
            skills: ["Holo-UI Design", "Visualizing Matrixes", "CSS Particle Dust"],
            completedGigs: 28,
            rating: 4.8,
            dailyRate: 120,
            wallet: "GCPLEIADES54J2HGHG3G64G2A6O7F3T6N2S4EXY34NFWX24EXY5M43ELI3"
          },
          {
            id: 3,
            name: "Krog the Unstoppable",
            species: "Kroggan Behemoth",
            avatar: "🦎",
            skills: ["Asteroid Mining Control", "Heavy Hauler Piloting", "Plasma Welds"],
            completedGigs: 64,
            rating: 4.6,
            dailyRate: 200,
            wallet: "GCKROGGAN45J23GEXJWYG2W7O7F3H3K34NFWX2S4EXY5M43EXYKROG43"
          }
        ];
        
        const mockGigs = [
          {
            id: 1,
            title: "Hyperdrive Core Refactoring",
            description: "The primary warp engine on our deep-space transport vessel is throwing stack overflows in the warp-field balance equation. Need a top-tier systems programmer to audit and optimize the Rust assembler files.",
            captain: "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1",
            crew: mockCrew[0],
            status: "active",
            budget: 600,
            requiredSkills: ["Hyperdrive Engineering", "Quantum Assembly"],
            speciesPref: "Cyborg-Krylon",
            milestones: [
              { id: 0, description: "Deconstruct Core Assemblies and audit logic", amount: 200, funded: true, submitted: true, released: false, disputed: false },
              { id: 1, description: "Inject optimized field balance modules", amount: 250, funded: true, submitted: false, released: false, disputed: false },
              { id: 2, description: "Run warp velocity tests & sign-off", amount: 150, funded: false, submitted: false, released: false, disputed: false }
            ],
            applications: []
          },
          {
            id: 2,
            title: "Dysonsphere Holo-UI Design",
            description: "Looking for an artist to craft a beautiful, high-fidelity HUD interface for managing orbital solar arrays around Kepler-186. The layout needs to look spectacular, visualising plasma flows and power levels.",
            captain: "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1",
            crew: null,
            status: "open",
            budget: 450,
            requiredSkills: ["Holo-UI Design", "Visualizing Matrixes"],
            speciesPref: "Any",
            milestones: [
              { id: 0, description: "Wireframes and Neon Color Guidelines", amount: 150, funded: false, submitted: false, released: false, disputed: false },
              { id: 1, description: "Interactive canvas animations showing stream flows", amount: 300, funded: false, submitted: false, released: false, disputed: false }
            ],
            applications: [
              { crewId: 2, proposal: "As a Pleiadian Holo-Architect, I specialize in CSS particle dust and responsive spaceship HUD layouts. I can complete this in 3 sub-light periods!", timestamp: new Date().toISOString() }
            ]
          }
        ];

        setCrewMembers(mockCrew);
        setGigs(mockGigs);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    checkWalletConnection();
  }, []);

  // Check wallet
  async function checkWalletConnection() {
    const installed = await checkFreighterInstalled();
    setWalletInstalled(installed);
    if (installed) {
      const address = await getWalletAddress();
      if (address) setWalletAddress(address);
    }
  }

  // Connect Wallet Action
  async function connectWallet() {
    const address = await getWalletAddress();
    setWalletAddress(address);
    setWalletInstalled(true);
  }

  // Handle application submission
  async function handleApply(gigId, proposalText) {
    // Default applicant: Lira Starweaver (id = 2) for convenience
    const crewId = 2; 

    try {
      const res = await fetch(`${BACKEND_URL}/gigs/${gigId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewId, proposal: proposalText })
      });
      if (res.ok) {
        const data = await res.json();
        setGigs(prev => prev.map(g => g.id === gigId ? data.gig : g));
      } else {
        throw new Error();
      }
    } catch {
      // Sandbox fallback updates
      setGigs(prev => prev.map(g => {
        if (g.id === gigId) {
          const apps = [...g.applications];
          if (!apps.some(a => a.crewId === crewId)) {
            apps.push({ crewId, proposal: proposalText, timestamp: new Date().toISOString() });
          }
          return { ...g, applications: apps };
        }
        return g;
      }));
    }
  }

  // Handle contracting crew members (Hiring)
  async function handleHire(gigId, crewId) {
    try {
      const res = await fetch(`${BACKEND_URL}/gigs/${gigId}/hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewId })
      });
      if (res.ok) {
        const data = await res.json();
        setGigs(prev => prev.map(g => g.id === gigId ? data.gig : g));
      } else {
        throw new Error();
      }
    } catch {
      // Sandbox fallback
      const crew = crewMembers.find(c => c.id === parseInt(crewId));
      setGigs(prev => prev.map(g => {
        if (g.id === gigId) {
          return { ...g, crew, status: 'active' };
        }
        return g;
      }));
    }
  }

  // Handle funding a milestone escrow
  async function handleFundMilestone(gigId, mIdx, amount) {
    if (balance < amount) {
      alert("Insufficient Cosmic Credits (XCC) balance inside cockpit terminal.");
      return;
    }

    // Trigger Freighter / Soroban crypto check
    await sorobanFundMilestone(gigId, mIdx, amount);

    // Setup visualizer particle stream callback
    setVisualizerAmount(amount);
    setVisualizerCallback(() => async () => {
      // Deduct balance
      setBalance(prev => prev - amount);

      // Hit API
      try {
        await fetch(`${BACKEND_URL}/gigs/${gigId}/milestones/${mIdx}/fund`, { method: 'POST' });
      } catch (err) {}

      // Update state
      setGigs(prev => prev.map(g => {
        if (g.id === gigId) {
          const updatedMs = [...g.milestones];
          updatedMs[mIdx] = { ...updatedMs[mIdx], funded: true };
          return { ...g, milestones: updatedMs };
        }
        return g;
      }));
    });
    setVisualizerActive(true);
  }

  // Handle milestone completion submission by Crew
  async function handleSubmitMilestone(gigId, mIdx) {
    await sorobanSubmitMilestone(gigId, mIdx);

    try {
      await fetch(`${BACKEND_URL}/gigs/${gigId}/milestones/${mIdx}/submit`, { method: 'POST' });
    } catch (err) {}

    setGigs(prev => prev.map(g => {
      if (g.id === gigId) {
        const updatedMs = [...g.milestones];
        updatedMs[mIdx] = { ...updatedMs[mIdx], submitted: true };
        return { ...g, milestones: updatedMs };
      }
      return g;
    }));
  }

  // Handle releasing a funded milestone to contractor
  async function handleReleaseMilestone(gigId, mIdx, amount) {
    await sorobanReleaseMilestone(gigId, mIdx);

    // Setup stardust release visualizer
    setVisualizerAmount(amount);
    setVisualizerCallback(() => async () => {
      // Payout triggers simulated balance increase if we play contractor
      // In sandbox, let's just log and update the API
      try {
        await fetch(`${BACKEND_URL}/gigs/${gigId}/milestones/${mIdx}/release`, { method: 'POST' });
      } catch (err) {}

      setGigs(prev => prev.map(g => {
        if (g.id === gigId) {
          const updatedMs = [...g.milestones];
          updatedMs[mIdx] = { ...updatedMs[mIdx], released: true, submitted: true };
          
          // Complete gig status if all done
          const allReleased = updatedMs.every(m => m.released);
          return { 
            ...g, 
            milestones: updatedMs, 
            status: allReleased ? 'completed' : g.status 
          };
        }
        return g;
      }));
    });
    setVisualizerActive(true);
  }

  // Handle disputing a milestone
  async function handleDisputeMilestone(gigId, mIdx) {
    if (!confirm("Are you sure you want to trigger a COSMIC MEDIATION dispute? This halts standard payouts.")) return;
    
    await sorobanDisputeMilestone(gigId, mIdx);

    try {
      await fetch(`${BACKEND_URL}/gigs/${gigId}/milestones/${mIdx}/dispute`, { method: 'POST' });
    } catch (err) {}

    setGigs(prev => prev.map(g => {
      if (g.id === gigId) {
        const updatedMs = [...g.milestones];
        updatedMs[mIdx] = { ...updatedMs[mIdx], disputed: true };
        return { ...g, milestones: updatedMs, status: 'disputed' };
      }
      return g;
    }));
  }

  // Handle creating a new galactic gig opportunity
  async function handleCreateGigSubmit(e) {
    e.preventDefault();

    // Validate milestone budget sum matches the total budget
    const milestonesSum = formMilestones.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0);
    if (milestonesSum !== parseFloat(formBudget)) {
      alert(`Validation error: The sum of milestones (${milestonesSum} XCC) must exactly equal the total budget (${formBudget} XCC).`);
      return;
    }

    const skillsArray = formSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newGigPayload = {
      title: formTitle,
      description: formDesc,
      captain: walletAddress || "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1",
      budget: parseFloat(formBudget),
      requiredSkills: skillsArray,
      speciesPref: formSpecies,
      milestones: formMilestones
    };

    try {
      const res = await fetch(`${BACKEND_URL}/gigs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGigPayload)
      });
      if (res.ok) {
        const createdGig = await res.json();
        setGigs(prev => [...prev, createdGig]);
      } else {
        throw new Error();
      }
    } catch {
      // Sandbox fallback
      const mockNewGig = {
        id: gigs.length + 1,
        ...newGigPayload,
        crew: null,
        status: 'open',
        applications: []
      };
      setGigs(prev => [...prev, mockNewGig]);
    }

    setFormSuccess(true);
    setTimeout(() => {
      // Reset form states
      setFormTitle('');
      setFormDesc('');
      setFormBudget(500);
      setFormSkills('');
      setFormSpecies('Any');
      setFormMilestones([
        { description: 'Initial Alpha wireframes', amount: 150 },
        { description: 'Final release and tests', amount: 350 }
      ]);
      setFormSuccess(false);
      setActiveTab('marketplace');
    }, 2000);
  }

  // Milestone Form Builders
  const addFormMilestoneRow = () => {
    setFormMilestones(prev => [...prev, { description: '', amount: 0 }]);
  };

  const removeFormMilestoneRow = (idx) => {
    setFormMilestones(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFormMilestone = (idx, field, val) => {
    setFormMilestones(prev => prev.map((m, i) => {
      if (i === idx) {
        return { 
          ...m, 
          [field]: field === 'amount' ? parseFloat(val) || 0 : val 
        };
      }
      return m;
    }));
  };

  const selectedGig = gigs.find(g => g.id === selectedGigId);

  // Filters for searching gigs
  const filteredGigs = gigs.filter(g => {
    const q = searchQuery.toLowerCase();
    return g.title.toLowerCase().includes(q) || 
           g.description.toLowerCase().includes(q) ||
           g.requiredSkills.some(s => s.toLowerCase().includes(q));
  });

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedGigId(null); // Clear selected gig when changing tabs
      }}
      walletAddress={walletAddress}
      connectWallet={connectWallet}
      walletInstalled={walletInstalled}
      balance={balance}
    >
      {/* FULLSCREEN CANVAS PAYMENT VISUALIZER */}
      <Visualizer
        active={visualizerActive}
        amount={visualizerAmount}
        onComplete={() => {
          setVisualizerActive(false);
          if (visualizerCallback) {
            visualizerCallback();
            setVisualizerCallback(null);
          }
        }}
      />

      {loading ? <LoadingScreen /> : selectedGig ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 242, 254, 0.2)', borderTopColor: 'var(--neon-teal)', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }}></div>
          <span style={{ fontFamily: 'var(--font-cyber)', fontSize: '12px', letterSpacing: '0.1em' }}>BOOTING GIGNEX HUD REGISTRY...</span>
        </div>
      ) : selectedGig ? (
        /* ESCROW DASHBOARD SCREEN */
        <EscrowDashboard
          gig={selectedGig}
          onBack={() => setSelectedGigId(null)}
          onFund={handleFundMilestone}
          onSubmit={handleSubmitMilestone}
          onRelease={handleReleaseMilestone}
          onDispute={handleDisputeMilestone}
          onHire={handleHire}
          crewMembers={crewMembers}
          currentWallet={walletAddress || "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1"}
        />
      ) : activeTab === 'marketplace' ? (
        /* MARKETPLACE SCREEN */
        <div>
          <div className="dashboard-hero">
            <span className="hero-subtitle">🌌 Galactic Mission Control Board</span>
            <h1 className="hero-title">Cosmic Gig Board</h1>
            <p className="hero-desc">
              Browse available contract opportunities across deep space. Captains fund secure escrow milestones; crew members submit proof of completion to instantly stream payouts.
            </p>
          </div>

          {/* Search bar and Filters */}
          <div className="view-header-bar glass-panel" style={{ padding: '16px 24px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '400px' }}>
              <Search size={18} style={{ color: 'var(--neon-teal)' }} />
              <input 
                type="text" 
                placeholder="Search gigs by name or stellar skills..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '4px 8px' }}
              />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              AVAILABLE SCANS: <strong style={{ color: 'var(--text-bright)' }}>{filteredGigs.length}</strong> Gigs
            </div>
          </div>

          {/* Cards Grid */}
          {filteredGigs.length > 0 ? (
            <div className="gigs-grid">
              {filteredGigs.map(gig => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  onApply={handleApply}
                  onManage={(id) => {
                    setSelectedGigId(id);
                    setActiveTab('dashboard');
                  }}
                  currentWallet={walletAddress || "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1"}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🛰️</span>
              <h3>No mission signals detected</h3>
              <p className="text-muted" style={{ maxWidth: '400px', margin: '8px auto 0', fontSize: '14px' }}>
                Try adjusting your cockpit scanner search filters to receive deeper space frequencies.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'post-gig' ? (
        /* POST A GIG SCREEN */
        <div className="glass-panel form-container">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Rocket size={32} style={{ color: 'var(--neon-teal)', marginBottom: '12px' }} />
            <h2>Post Galactic Escrow Mission</h2>
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>
              Establish a new milestone-based Soroban escrow contract. Guarantee credits safety for expert crew.
            </p>
          </div>

          {formSuccess ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid #27ae60', background: 'rgba(39, 174, 96, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#27ae60' }}>
              <CheckCircle2 size={40} />
              <h3>MISSION REGISTERED SUCCESSFUL</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Broadcasting contract escrow parameters directly to Sector Validator Nodes...
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateGigSubmit}>
              <div className="form-group">
                <label>Mission Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Warp Reactor Shield Weld repair" 
                  required
                />
              </div>

              <div className="form-group">
                <label>Mission Description</label>
                <textarea 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Provide precise details of the mission deliverables, sector safety standards, and tech requirements..."
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Total Budget (Cosmic Credits)</label>
                  <input 
                    type="number" 
                    value={formBudget}
                    onChange={(e) => setFormBudget(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 500" 
                    min={10}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Alien Species Preference</label>
                  <select value={formSpecies} onChange={(e) => setFormSpecies(e.target.value)}>
                    <option value="Any">Any Spacefarer species</option>
                    <option value="Cyborg-Krylon">Cyborg-Krylon (Engineering)</option>
                    <option value="Pleiadian Holo-Elf">Pleiadian Holo-Elf (Design)</option>
                    <option value="Kroggan Behemoth">Kroggan Behemoth (Hauling)</option>
                    <option value="Zoltan Energy Entity">Zoltan Energy Entity (Subspace)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Skills Required (comma separated)</label>
                <input 
                  type="text" 
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="e.g. Fusion Shielding, Plasma Welds" 
                  required
                />
              </div>

              {/* DYNAMIC MILESTONES SECTION */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label style={{ fontFamily: 'var(--font-cyber)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-bright)' }}>
                    Escrow Milestones Pipeline
                  </label>
                  <button type="button" onClick={addFormMilestoneRow} className="btn-glass" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={12} /> Add Milestone
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formMilestones.map((m, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '12px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={m.description}
                        onChange={(e) => updateFormMilestone(idx, 'description', e.target.value)}
                        placeholder={`Milestone #${idx + 1} Deliverable...`}
                        style={{ fontSize: '12.5px' }}
                        required
                      />
                      <input 
                        type="number" 
                        value={m.amount}
                        onChange={(e) => updateFormMilestone(idx, 'amount', e.target.value)}
                        placeholder="Amount"
                        style={{ fontSize: '12.5px' }}
                        min={1}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => removeFormMilestoneRow(idx)}
                        className="btn-danger"
                        style={{ padding: '10px' }}
                        disabled={formMilestones.length <= 1}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Milestone validation helper */}
                <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '12px' }}>
                  <span style={{ color: formMilestones.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0) === formBudget ? '#27ae60' : 'var(--neon-pink)' }}>
                    Sum of Milestones: {formMilestones.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0)} XCC / Total Budget: {formBudget} XCC
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="button" onClick={() => setActiveTab('marketplace')} className="btn-glass" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-neon-teal" style={{ flex: 2, justifyContent: 'center' }}>
                  Initialize Escrow Registry
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* DASHBOARD SUMMARY VIEW */
        <div>
          <div className="dashboard-hero">
            <span className="hero-subtitle">📡 Cryptographic Registry Registry</span>
            <h1 className="hero-title">Your Escrow Dashboard</h1>
            <p className="hero-desc">
              Track active escrow portfolios. Check current milestone pipelines, submit proof records, and claim payouts.
            </p>
          </div>

          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Active Space Engagements</h2>
          
          {gigs.some(g => g.status === 'active' || g.status === 'disputed') ? (
            <div className="gigs-grid">
              {gigs.filter(g => g.status === 'active' || g.status === 'disputed').map(gig => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  onApply={handleApply}
                  onManage={(id) => setSelectedGigId(id)}
                  currentWallet={walletAddress || "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1"}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>🔒</span>
              <h3>No active escrows detected</h3>
              <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
                Engage spacefarers on the Marketplace or register a new contract.
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
