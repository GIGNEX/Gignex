#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub amount: i128,
    pub funded: bool,
    pub submitted: bool,
    pub released: bool,
    pub disputed: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Gig {
    pub captain: Address,
    pub crew: Address,
    pub token: Address,
    pub milestones: Vec<Milestone>,
    pub resolved: bool,
}

#[contract]
pub struct GigEscrowContract;

#[contractimpl]
impl GigEscrowContract {
    /// Initializes a new galactic gig escrow between a Captain (client) and a Crew Member (freelancer).
    pub fn create_gig(
        e: Env,
        captain: Address,
        crew: Address,
        token: Address,
    ) -> u32 {
        captain.require_auth();

        let gig = Gig {
            captain,
            crew,
            token,
            milestones: Vec::new(&e),
            resolved: false,
        };

        let gig_id: u32 = e.storage().instance().get(&Symbol::new(&e, "next_id")).unwrap_or(0);
        e.storage().persistent().set(&gig_id, &gig);
        e.storage().instance().set(&Symbol::new(&e, "next_id"), &(gig_id + 1));

        gig_id
    }

    /// Appends a milestone to an existing gig. Can only be done by the Captain before funding.
    pub fn add_milestone(e: Env, gig_id: u32, amount: i128) -> u32 {
        let mut gig: Gig = e.storage().persistent().get(&gig_id).expect("Gig not found");
        gig.captain.require_auth();
        assert!(!gig.resolved, "Gig already resolved");

        let milestone = Milestone {
            amount,
            funded: false,
            submitted: false,
            released: false,
            disputed: false,
        };

        let mut milestones = gig.milestones;
        milestones.push_back(milestone);
        gig.milestones = milestones.clone();
        
        e.storage().persistent().set(&gig_id, &gig);
        
        milestones.len() - 1
    }

    /// Deposits funds for a specific milestone into the escrow contract.
    pub fn fund_milestone(e: Env, gig_id: u32, milestone_idx: u32) {
        let mut gig: Gig = e.storage().persistent().get(&gig_id).expect("Gig not found");
        gig.captain.require_auth();
        assert!(!gig.resolved, "Gig already resolved");

        let mut milestones = gig.milestones;
        let mut milestone = milestones.get(milestone_idx).expect("Milestone index out of bounds");
        assert!(!milestone.funded, "Milestone already funded");

        // Set milestone as funded
        milestone.funded = true;
        milestones.set(milestone_idx, milestone.clone());
        gig.milestones = milestones;
        e.storage().persistent().set(&gig_id, &gig);

        // Note: Standard token transfer interface to lock funds in this contract:
        // token::Client::new(&e, &gig.token).transfer(&gig.captain, &e.current_contract_address(), &milestone.amount);
    }

    /// Crew Member submits work completed for a funded milestone.
    pub fn submit_milestone(e: Env, gig_id: u32, milestone_idx: u32) {
        let mut gig: Gig = e.storage().persistent().get(&gig_id).expect("Gig not found");
        gig.crew.require_auth();

        let mut milestones = gig.milestones;
        let mut milestone = milestones.get(milestone_idx).expect("Milestone index out of bounds");
        assert!(milestone.funded, "Milestone not funded yet");
        assert!(!milestone.submitted, "Milestone already submitted");
        assert!(!milestone.released, "Milestone already released");

        milestone.submitted = true;
        milestones.set(milestone_idx, milestone);
        gig.milestones = milestones;
        e.storage().persistent().set(&gig_id, &gig);
    }

    /// Captain approves the work and releases the locked milestone funds to the Crew Member.
    pub fn release_milestone(e: Env, gig_id: u32, milestone_idx: u32) {
        let mut gig: Gig = e.storage().persistent().get(&gig_id).expect("Gig not found");
        gig.captain.require_auth();

        let mut milestones = gig.milestones;
        let mut milestone = milestones.get(milestone_idx).expect("Milestone index out of bounds");
        assert!(milestone.funded, "Milestone not funded");
        assert!(!milestone.released, "Milestone already released");

        // Update state
        milestone.released = true;
        milestone.submitted = true; // In case they release without manual crew submission
        milestones.set(milestone_idx, milestone.clone());
        gig.milestones = milestones;

        // Check if all milestones are released to mark gig as resolved
        let mut all_done = true;
        for i in 0..gig.milestones.len() {
            if !gig.milestones.get(i).unwrap().released {
                all_done = false;
                break;
            }
        }
        gig.resolved = all_done;

        e.storage().persistent().set(&gig_id, &gig);

        // Note: Standard token transfer interface to release funds from escrow to crew member:
        // token::Client::new(&e, &gig.token).transfer(&e.current_contract_address(), &gig.crew, &milestone.amount);
    }

    /// Triggers a dispute state on a milestone. Either Captain or Crew can call this.
    pub fn dispute_milestone(e: Env, gig_id: u32, milestone_idx: u32) {
        let mut gig: Gig = e.storage().persistent().get(&gig_id).expect("Gig not found");
        
        // Either party can raise a dispute
        let mut is_captain = false;
        if gig.captain.has_auth() {
            is_captain = true;
        } else {
            gig.crew.require_auth();
        }

        let mut milestones = gig.milestones;
        let mut milestone = milestones.get(milestone_idx).expect("Milestone index out of bounds");
        assert!(milestone.funded, "Milestone not funded");
        assert!(!milestone.released, "Milestone already released");
        assert!(!milestone.disputed, "Milestone already disputed");

        milestone.disputed = true;
        milestones.set(milestone_idx, milestone);
        gig.milestones = milestones;
        e.storage().persistent().set(&gig_id, &gig);
    }

    /// View utility to fetch a gig's current state.
    pub fn get_gig(e: Env, gig_id: u32) -> Gig {
        e.storage().persistent().get(&gig_id).expect("Gig not found")
    }
}
