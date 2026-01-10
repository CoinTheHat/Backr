export const FACTORY_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_implementation", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "profileContract", "type": "address" }
        ],
        "name": "ProfileCreated",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_paymentToken", "type": "address" }
        ],
        "name": "createProfile",
        "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "name": "getProfile",
        "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export const SUBSCRIPTION_ABI = [
    {
        "inputs": [],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "uint256", "name": "_price", "type": "uint256" },
            { "internalType": "uint256", "name": "_duration", "type": "uint256" }
        ],
        "name": "createTier",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_tierId", "type": "uint256" }
        ],
        "name": "subscribe",
        "outputs": [],
        "stateMutability": "payable", // Important for MNT
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_user", "type": "address" }
        ],
        "name": "isMember",
        "outputs": [
            { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTiers",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "name", "type": "string" },
                    { "internalType": "uint256", "name": "price", "type": "uint256" },
                    { "internalType": "uint256", "name": "duration", "type": "uint256" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" }
                ],
                "internalType": "struct SubscriptionContract.Tier[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Provide a default address or load from env
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0xDcF299F82f4Ea4295f0e4C4216224f8E10154856"; // Mantle Mainnet Deployed with getProfile

