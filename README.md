## GIGNEX Backend (Node.js/Express)

The Gignex backend powers the platform's off-chain operations, providing a fast and scalable infrastructure for managing marketplace data. While Soroban smart contracts on Stellar handle escrow payments, milestone releases, and transaction security, the backend stores and processes data that would be costly or inefficient to keep on-chain.

### Features

* User profile management for freelancers and clients
* Gig, project, and proposal storage
* Portfolio and work showcase management
* Skill ratings and reputation tracking
* Species and identity metadata
* Search and discovery system
* Real-time notifications and activity updates
* Secure integration with Stellar wallets and Soroban smart contracts

### Tech Stack

* Node.js
* Express.js
* MongoDB
* Redis
* Stellar SDK
* Soroban SDK

### Purpose

The backend acts as the bridge between the user experience and the blockchain layer, ensuring that rich application data remains fast, searchable, and cost-efficient while maintaining the transparency and security of decentralized payments through the Stellar ecosystem.
