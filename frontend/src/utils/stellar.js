import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

// Configured for Stellar Testnet / Futurenet
export const STELLAR_NETWORK = "TESTNET";
export const GIGNEX_ESCROW_CONTRACT_ID = "CDGIGNEXESCROW447J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43GIGX";
export const COSMIC_CREDITS_TOKEN_ID = "CDCOSMICCREDITS777J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CRED";

/**
 * Checks if the Freighter Wallet extension is installed and active in the user's browser.
 */
export async function checkFreighterInstalled() {
  try {
    const connected = await isConnected();
    return !!connected;
  } catch (error) {
    console.warn("Freighter connection check failed, using simulated sandbox wallet.", error);
    return false;
  }
}

/**
 * Request public key (wallet address) from Freighter, or return a simulated captain address.
 */
export async function getWalletAddress() {
  try {
    const hasFreighter = await checkFreighterInstalled();
    if (hasFreighter) {
      const pubKey = await getPublicKey();
      if (pubKey) return pubKey;
    }
  } catch (err) {
    console.error("Freighter address acquisition failed: ", err);
  }
  // Return a beautiful mock wallet address
  return "GCCAPTAIN333J23G6EXJWYG2W73K7T3O7F3H3K34NFWX2S4EXY5M43CAP1";
}

/**
 * MOCK SOROBAN LEDGER INTERACTION LAYER
 * These functions simulate writing/reading states directly from the Soroban virtual machine.
 * This guarantees Gignex remains 100% operational in sandbox environments.
 */

// Simulated Ledger database stored in sessionStorage
const getSimulatedLedger = () => {
  const data = sessionStorage.getItem('gignex_ledger');
  return data ? JSON.parse(data) : {};
};

const saveSimulatedLedger = (ledger) => {
  sessionStorage.setItem('gignex_ledger', JSON.stringify(ledger));
};

export async function sorobanCreateGig(captain, crewAddress, budget) {
  console.log(`[Soroban RPC] Invoking: create_gig(e, captain=${captain}, crew=${crewAddress}, token=${COSMIC_CREDITS_TOKEN_ID})`);
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const ledger = getSimulatedLedger();
  const nextId = Object.keys(ledger).length + 4; // Start ids above mock datasets

  ledger[nextId] = {
    id: nextId,
    captain,
    crew: crewAddress,
    token: COSMIC_CREDITS_TOKEN_ID,
    budget,
    resolved: false
  };
  saveSimulatedLedger(ledger);

  return nextId;
}

export async function sorobanFundMilestone(gigId, milestoneIdx, amount) {
  console.log(`[Soroban RPC] Invoking: fund_milestone(e, gig_id=${gigId}, milestone_idx=${milestoneIdx}, amount=${amount} XCC)`);
  
  // Simulate cryptographic signing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true, txId: Math.random().toString(36).substring(2, 15).toUpperCase() };
}

export async function sorobanSubmitMilestone(gigId, milestoneIdx) {
  console.log(`[Soroban RPC] Invoking: submit_milestone(e, gig_id=${gigId}, milestone_idx=${milestoneIdx})`);
  
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
}

export async function sorobanReleaseMilestone(gigId, milestoneIdx) {
  console.log(`[Soroban RPC] Invoking: release_milestone(e, gig_id=${gigId}, milestone_idx=${milestoneIdx})`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true };
}

export async function sorobanDisputeMilestone(gigId, milestoneIdx) {
  console.log(`[Soroban RPC] Invoking: dispute_milestone(e, gig_id=${gigId}, milestone_idx=${milestoneIdx})`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
}
