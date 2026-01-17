// Global variables
let provider = null;
let signer = null;
let contract = null;
let userAccount = null;
let tokenDecimals = 18;

const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Token ABI
const TOKEN_ABI = [
    { "inputs": [], "name": "name", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "symbol", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "decimals", "outputs": [{ "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalSupply", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }
];

// Show status message
function showStatus(message, type) {
    const statusBox = document.getElementById('transferStatus');
    statusBox.className = 'status-box status-' + type;
    statusBox.textContent = message;
    statusBox.style.display = 'block';
    
    if (type !== 'pending') {
        setTimeout(() => { statusBox.style.display = 'none'; }, 5000);
    }
}

// Shorten address
function shortenAddress(address) {
    if (!address) return '-';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

// Get network name
function getNetworkName(chainId) {
    const networks = {
        1n: 'Ethereum Mainnet',
        11155111n: 'Sepolia',
        31337n: 'Localhost (Hardhat)',
        1337n: 'Localhost (Ganache)'
    };
    return networks[chainId] || 'Chain ID: ' + chainId;
}

// Connect wallet
async function connectWallet() {
    const connectBtn = document.getElementById('connectBtn');
    connectBtn.innerHTML = 'Connecting...';
    connectBtn.disabled = true;

    try {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed!');
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) throw new Error('No accounts found');

        userAccount = accounts[0];

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        const network = await provider.getNetwork();

        contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

        try {
            const symbol = await contract.symbol();
            tokenDecimals = await contract.decimals();
            document.getElementById('tokenSymbol').textContent = symbol;
        } catch (e) {
            console.log('Could not get token info');
        }

        document.getElementById('connectionStatus').textContent = 'Connected';
        document.getElementById('connectionStatus').className = 'info-value connected';
        document.getElementById('accountAddress').textContent = shortenAddress(userAccount);
        document.getElementById('networkName').textContent = getNetworkName(network.chainId);
        
        connectBtn.innerHTML = 'Connected';
        document.getElementById('transferBtn').disabled = false;

        await refreshBalance();
        setupEventListeners();
        listenToTransferEvents();

    } catch (error) {
        console.error('Connection error:', error);
        showStatus('Error: ' + error.message, 'error');
        connectBtn.innerHTML = 'Connect MetaMask';
        connectBtn.disabled = false;
    }
}

// Refresh balance
async function refreshBalance() {
    if (!contract || !userAccount) return;

    try {
        const balance = await contract.balanceOf(userAccount);
        const formatted = ethers.formatUnits(balance, tokenDecimals);
        document.getElementById('tokenBalance').textContent = parseFloat(formatted).toFixed(4);
    } catch (error) {
        console.error('Balance error:', error);
        document.getElementById('tokenBalance').textContent = 'Error';
    }
}

// Transfer tokens
async function transferTokens() {
    const recipient = document.getElementById('recipientAddress').value.trim();
    const amount = document.getElementById('transferAmount').value.trim();
    const transferBtn = document.getElementById('transferBtn');

    if (!recipient) {
        showStatus('Please enter recipient address', 'error');
        return;
    }
    if (!ethers.isAddress(recipient)) {
        showStatus('Invalid address format', 'error');
        return;
    }
    if (!amount || parseFloat(amount) <= 0) {
        showStatus('Please enter valid amount', 'error');
        return;
    }

    transferBtn.innerHTML = 'Sending...';
    transferBtn.disabled = true;
    showStatus('Transaction pending... Please confirm in MetaMask', 'pending');

    try {
        const amountWei = ethers.parseUnits(amount, tokenDecimals);

        const balance = await contract.balanceOf(userAccount);
        if (balance < amountWei) {
            throw new Error('Insufficient balance');
        }

        const tx = await contract.transfer(recipient, amountWei);
        showStatus('Waiting for confirmation...', 'pending');
        
        await tx.wait();
        showStatus('Transfer successful!', 'success');

        document.getElementById('recipientAddress').value = '';
        document.getElementById('transferAmount').value = '';
        await refreshBalance();

    } catch (error) {
        console.error('Transfer error:', error);
        
        if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            showStatus('Transaction rejected by user', 'error');
        } else {
            showStatus('Transfer failed: ' + (error.reason || error.message), 'error');
        }
    } finally {
        transferBtn.innerHTML = 'Transfer';
        transferBtn.disabled = false;
    }
}

// Listen for Transfer events
function listenToTransferEvents() {
    if (!contract) return;

    contract.on('Transfer', (from, to, value) => {
        addEventToList(from, to, value);

        if (from.toLowerCase() === userAccount.toLowerCase() || 
            to.toLowerCase() === userAccount.toLowerCase()) {
            refreshBalance();
        }
    });
}

// Add event to list
function addEventToList(from, to, value) {
    const eventsList = document.getElementById('eventsList');
    
    if (eventsList.querySelector('.event-item[style]')) {
        eventsList.innerHTML = '';
    }

    const formatted = ethers.formatUnits(value, tokenDecimals);
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    eventItem.innerHTML = `
        <span class="from">${shortenAddress(from)}</span> to 
        <span class="to">${shortenAddress(to)}</span>: 
        <span class="amount">${parseFloat(formatted).toFixed(4)} MTK</span>
    `;

    eventsList.insertBefore(eventItem, eventsList.firstChild);

    while (eventsList.children.length > 10) {
        eventsList.removeChild(eventsList.lastChild);
    }
}

// Setup account/network change listeners
function setupEventListeners() {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            location.reload();
        } else {
            userAccount = accounts[0];
            document.getElementById('accountAddress').textContent = shortenAddress(userAccount);
            await refreshBalance();
        }
    });

    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}

// Auto-connect on load
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await connectWallet();
        }
    }
});
