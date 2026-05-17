const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Mock Freelance Crew Members Database
let crewMembers = [
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
  },
  {
    id: 4,
    name: "Dr. Zephyrus Blink",
    species: "Zoltan Energy Entity",
    avatar: "🔋",
    skills: ["Sub-space Routing", "Soroban Escrow Audits", "Quantum Entangling"],
    completedGigs: 19,
    rating: 5.0,
    dailyRate: 180,
    wallet: "GCZOLTAN55J23GEXJWYG2W7O7F3H3K34NFWX2S4EXY5M43EXYZOLTAN"
  }
];

// Mock Gigs & Escrows Database
let gigs = [
  {
    id: 1,
    title: "Hyperdrive Core Refactoring",
    description: "The primary warp engine on our deep-space transport vessel is throwing stack overflows in the warp-field balance equation. Need a top-tier systems programmer to audit and optimize the Rust assembler files.",
    captain: "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1",
    crew: crewMembers[0], // Pre-assigned Xanthor Vex
    status: "active",
    budget: 600,
    requiredSkills: ["Hyperdrive Engineering", "Quantum Assembly"],
    speciesPref: "Cyborg-Krylon",
    milestones: [
      {
        id: 0,
        description: "Deconstruct Core Assemblies and audit logic",
        amount: 200,
        funded: true,
        submitted: true,
        released: false,
        disputed: false
      },
      {
        id: 1,
        description: "Inject optimized field balance modules",
        amount: 250,
        funded: true,
        submitted: false,
        released: false,
        disputed: false
      },
      {
        id: 2,
        description: "Run warp velocity tests & sign-off",
        amount: 150,
        funded: false,
        submitted: false,
        released: false,
        disputed: false
      }
    ],
    applications: []
  },
  {
    id: 2,
    title: "Dysonsphere Holo-UI Design",
    description: "Looking for an artist to craft a beautiful, high-fidelity HUD interface for managing orbital solar arrays around Kepler-186. The layout needs to look spectacular, visualising plasma flows and power levels.",
    captain: "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1",
    crew: null, // Open for recruitment
    status: "open",
    budget: 450,
    requiredSkills: ["Holo-UI Design", "Visualizing Matrixes"],
    speciesPref: "Any",
    milestones: [
      {
        id: 0,
        description: "Wireframes and Neon Color Guidelines",
        amount: 150,
        funded: false,
        submitted: false,
        released: false,
        disputed: false
      },
      {
        id: 1,
        description: "Interactive canvas animations showing stream flows",
        amount: 300,
        funded: false,
        submitted: false,
        released: false,
        disputed: false
      }
    ],
    applications: [
      {
        crewId: 2,
        proposal: "As a Pleiadian Holo-Architect, I specialize in CSS particle dust and responsive spaceship HUD layouts. I can complete this in 3 sub-light periods!",
        timestamp: "2026-05-17T10:00:00Z"
      }
    ]
  },
  {
    id: 3,
    title: "Quantum Fuel rod escort through Sector 7",
    description: "Require an experienced heavy-hauling convoy pilot to safely navigate critical quantum materials through dense asteroid fields. Expected danger level: Moderate. Compensation will be escrow-locked upon departure.",
    captain: "GCCAPTAIN444J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP2",
    crew: null,
    status: "open",
    budget: 800,
    requiredSkills: ["Asteroid Mining Control", "Heavy Hauler Piloting"],
    speciesPref: "Kroggan Behemoth",
    milestones: [
      {
        id: 0,
        description: "Safe arrival at Sector 7 Border Patrol station",
        amount: 400,
        funded: false,
        submitted: false,
        released: false,
        disputed: false
      },
      {
        id: 1,
        description: "Deliver rods safely to Alpha Centauri Station C",
        amount: 400,
        funded: false,
        submitted: false,
        released: false,
        disputed: false
      }
    ],
    applications: []
  }
];

// --- REST ENDPOINTS ---

// 1. Get Crew Members
app.get('/api/crew', (req, res) => {
  res.json(crewMembers);
});

// 2. Get Gigs list
app.get('/api/gigs', (req, res) => {
  res.json(gigs);
});

// 3. Create a Gig
app.post('/api/gigs', (req, res) => {
  const { title, description, captain, budget, requiredSkills, speciesPref, milestones } = req.body;

  if (!title || !description || !captain || !budget) {
    return res.status(400).json({ error: "Missing required core details: title, description, captain, budget." });
  }

  // Format milestones
  const formattedMilestones = (milestones || []).map((m, idx) => ({
    id: idx,
    description: m.description || `Milestone #${idx + 1}`,
    amount: parseFloat(m.amount) || (budget / (milestones.length || 1)),
    funded: false,
    submitted: false,
    released: false,
    disputed: false
  }));

  const newGig = {
    id: gigs.length + 1,
    title,
    description,
    captain,
    crew: null,
    status: "open",
    budget: parseFloat(budget),
    requiredSkills: requiredSkills || [],
    speciesPref: speciesPref || "Any",
    milestones: formattedMilestones,
    applications: []
  };

  gigs.push(newGig);
  res.status(201).json(newGig);
});

// 4. Get a Single Gig Details
app.get('/api/gigs/:id', (req, res) => {
  const gig = gigs.find(g => g.id === parseInt(req.params.id));
  if (gig) {
    res.json(gig);
  } else {
    res.status(404).json({ error: "Galactic Gig not found." });
  }
});

// 5. Apply for a Gig (by a Crew Member)
app.post('/api/gigs/:id/apply', (req, res) => {
  const gigId = parseInt(req.params.id);
  const gig = gigs.find(g => g.id === gigId);

  if (!gig) {
    return res.status(404).json({ error: "Gig not found." });
  }

  const { crewId, proposal } = req.body;
  const crew = crewMembers.find(c => c.id === parseInt(crewId));

  if (!crew) {
    return res.status(404).json({ error: "Crew member not found." });
  }

  // Check if already applied
  const alreadyApplied = gig.applications.some(a => a.crewId === crew.id);
  if (alreadyApplied) {
    return res.status(400).json({ error: "Crew member already applied to this gig." });
  }

  // Record application
  gig.applications.push({
    crewId: crew.id,
    proposal: proposal || "Ready for deep-space missions.",
    timestamp: new Date().toISOString()
  });

  // For presentation/scaffold ease: if open gig receives an application, let's allow hiring!
  // In our flow, we'll assign the crew member when captain approves
  res.json({ message: "Application broadcasted successfully across the Sector networks.", gig });
});

// 6. Assign Crew Member to Gig (Hire)
app.post('/api/gigs/:id/hire', (req, res) => {
  const gigId = parseInt(req.params.id);
  const gig = gigs.find(g => g.id === gigId);

  if (!gig) return res.status(404).json({ error: "Gig not found." });

  const { crewId } = req.body;
  const crew = crewMembers.find(c => c.id === parseInt(crewId));

  if (!crew) return res.status(404).json({ error: "Crew member not found." });

  gig.crew = crew;
  gig.status = "active";
  res.json({ message: "Crew contracted! Escrow contract is now active.", gig });
});

// 7. Fund a Milestone
app.post('/api/gigs/:id/milestones/:mIdx/fund', (req, res) => {
  const { id, mIdx } = req.params;
  const gig = gigs.find(g => g.id === parseInt(id));

  if (!gig) return res.status(404).json({ error: "Gig not found." });

  const milestone = gig.milestones[parseInt(mIdx)];
  if (!milestone) return res.status(404).json({ error: "Milestone index out of bounds." });

  milestone.funded = true;
  res.json({ message: `Stellar credits locked in escrow for Milestone #${mIdx}.`, gig });
});

// 8. Submit a Milestone (Crew finished work)
app.post('/api/gigs/:id/milestones/:mIdx/submit', (req, res) => {
  const { id, mIdx } = req.params;
  const gig = gigs.find(g => g.id === parseInt(id));

  if (!gig) return res.status(404).json({ error: "Gig not found." });

  const milestone = gig.milestones[parseInt(mIdx)];
  if (!milestone) return res.status(404).json({ error: "Milestone index out of bounds." });
  if (!milestone.funded) return res.status(400).json({ error: "Cannot submit work for an unfunded milestone." });

  milestone.submitted = true;
  res.json({ message: `Work submitted for Milestone #${mIdx}. Waiting Captain's audit.`, gig });
});

// 9. Release a Milestone (Captain pays)
app.post('/api/gigs/:id/milestones/:mIdx/release', (req, res) => {
  const { id, mIdx } = req.params;
  const gig = gigs.find(g => g.id === parseInt(id));

  if (!gig) return res.status(404).json({ error: "Gig not found." });

  const milestone = gig.milestones[parseInt(mIdx)];
  if (!milestone) return res.status(404).json({ error: "Milestone index out of bounds." });
  if (!milestone.funded) return res.status(400).json({ error: "Escrow must be funded before release." });

  milestone.released = true;
  milestone.submitted = true;

  // Check if all milestones are released to complete the gig
  const allReleased = gig.milestones.every(m => m.released);
  if (allReleased) {
    gig.status = "completed";
  }

  res.json({ message: `Escrow released! Credits delivered to crew address.`, gig });
});

// 10. Dispute a Milestone
app.post('/api/gigs/:id/milestones/:mIdx/dispute', (req, res) => {
  const { id, mIdx } = req.params;
  const gig = gigs.find(g => g.id === parseInt(id));

  if (!gig) return res.status(404).json({ error: "Gig not found." });

  const milestone = gig.milestones[parseInt(mIdx)];
  if (!milestone) return res.status(404).json({ error: "Milestone index out of bounds." });
  if (!milestone.funded) return res.status(400).json({ error: "Cannot dispute an unfunded milestone." });

  milestone.disputed = true;
  gig.status = "disputed";
  res.json({ message: `Escrow disputed. Transmitting signal to the cosmic mediation courts.`, gig });
});

app.listen(PORT, () => {
  console.log(`🌌 Gignex Galactic Backend indexing on http://localhost:${PORT}`);
});
