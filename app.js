// Simple DAPP Smart Contract Interaction

// Global variables
let provider = null;
let signer = null;
let contract = null;
let userAccount = null;

// CONTRACT CONFIGURATION

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Simple Storage Contract ABI

const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "get",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getValue",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "storedValue",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "retrieve",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    // Write function 
    {
        "inputs": [{ "internalType": "uint256", "name": "_value", "type": "uint256" }],
        "name": "set",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// UI HELPER FUNCTIONS

function showError(message) {
    const errorBox = document.getElementById('errorBox');
    const successBox = document.getElementById('successBox');
    
    successBox.style.display = 'none';
    errorBox.textContent = '' + message;
    errorBox.style.display = 'block';
    
    setTimeout(() => {
        errorBox.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const errorBox = document.getElementById('errorBox');
    const successBox = document.getElementById('successBox');
    
    errorBox.style.display = 'none';
    successBox.textContent = message;
    successBox.style.display = 'block';
    
    setTimeout(() => {
        successBox.style.display = 'none';
    }, 5000);
}

function updateUI(elementId, value) {
    document.getElementById(elementId).textContent = value;
}

function setConnected(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    const readBtn = document.getElementById('readBtn');
    const connectBtn = document.getElementById('connectBtn');
    
    if (isConnected) {
        statusElement.textContent = 'Connected';
        statusElement.className = 'status-value connected';
        connectBtn.textContent = 'Connected';
        connectBtn.disabled = true;
        readBtn.disabled = false;
    } else {
        statusElement.textContent = 'Not Connected';
        statusElement.className = 'status-value disconnected';
        connectBtn.textContent = 'Connect MetaMask';
        connectBtn.disabled = false;
        readBtn.disabled = true;
    }
}

// WALLET CONNECTION

async function connectWallet() {
    console.log("Attempting to connect wallet...");
    
    try {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed! Please install MetaMask extension.');
        }
        
        console.log("MetaMask detected!");
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (accounts.length === 0) {
            throw new Error('No accounts found. Please unlock MetaMask.');
        }
        
        userAccount = accounts[0];
        console.log("Connected account:", userAccount);
        
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        const network = await provider.getNetwork();
        const networkName = getNetworkName(network.chainId);
        console.log("Connected to network:", networkName);
        
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        console.log("Contract instance created at:", CONTRACT_ADDRESS);
        
        updateUI('accountAddress', shortenAddress(userAccount));
        updateUI('networkName', networkName);
        setConnected(true);
        
        showSuccess('Wallet connected successfully!');
        
        setupEventListeners();
        
    } catch (error) {
        console.error("Connection error:", error);
        showError(error.message || 'Failed to connect wallet');
        setConnected(false);
    }
}

// READ CONTRACT VALUE

async function readContractValue() {
    console.log("Reading value from contract...");
    
    const readBtn = document.getElementById('readBtn');
    readBtn.innerHTML = '<span class="loading"></span> Reading...';
    readBtn.disabled = true;
    
    try {
        if (!contract) {
            throw new Error('Contract not initialized. Please connect wallet first.');
        }
        
        let value = null;
        let functionUsed = '';
        
        const functionNames = ['get', 'getValue', 'storedValue', 'retrieve'];
        
        for (const funcName of functionNames) {
            try {
                if (contract[funcName]) {
                    value = await contract[funcName]();
                    functionUsed = funcName;
                    console.log(`Successfully called ${funcName}(), value:`, value.toString());
                    break;
                }
            } catch (e) {
                console.log(`Function ${funcName}() not available or failed`);
            }
        }
        
        if (value === null) {
            throw new Error('Could not read value. Make sure the contract has a get/getValue/retrieve function.');
        }
        
        updateUI('contractValue', value.toString());
        showSuccess(`Value read successfully using ${functionUsed}(): ${value.toString()}`);
        
    } catch (error) {
        console.error("Read error:", error);
        showError(error.message || 'Failed to read contract value');
        updateUI('contractValue', 'Error');
    } finally {
        readBtn.innerHTML = 'Read Contract Value';
        readBtn.disabled = false;
    }
}

// HELPER FUNCTIONS
function shortenAddress(address) {
    if (!address) return '-';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

function getNetworkName(chainId) {
    const networks = {
        1n: 'Ethereum Mainnet',
        5n: 'Goerli Testnet',
        11155111n: 'Sepolia Testnet',
        137n: 'Polygon Mainnet',
        80001n: 'Mumbai Testnet',
        56n: 'BSC Mainnet',
        97n: 'BSC Testnet',
        31337n: 'Localhost (Hardhat)',
        1337n: 'Localhost (Ganache)'
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
}

// EVENT LISTENERS
function setupEventListeners() {
    if (window.ethereum) {
        // Handle account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log("Account changed:", accounts);
            if (accounts.length === 0) {
                setConnected(false);
                updateUI('accountAddress', '-');
                updateUI('contractValue', '-');
                showError('Wallet disconnected');
            } else {
                userAccount = accounts[0];
                updateUI('accountAddress', shortenAddress(userAccount));
                showSuccess('Account changed');
            }
        });
        
        // Handle network changes
        window.ethereum.on('chainChanged', (chainId) => {
            console.log("Network changed:", chainId);
            window.location.reload();
        });
    }
}

// INITIALIZATION
window.addEventListener('load', async () => {
    console.log("Page loaded, checking for existing connection...");
    
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                console.log("Found existing connection, reconnecting...");
                await connectWallet();
            }
        } catch (error) {
            console.log("No existing connection found");
        }
    }
});

console.log("DApp initialized! Click 'Connect MetaMask' to start.");
