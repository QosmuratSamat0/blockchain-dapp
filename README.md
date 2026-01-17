# Simple DApp - Smart Contract Interaction

A simple HTML + JavaScript frontend that connects to MetaMask and interacts with a smart contract using Ethers.js.

## Features

Connect to MetaMask wallet  
Retrieve and display account address  
Read values from a deployed smart contract  
Display results dynamically  
Error handling  
Network detection  

## Files Structure

```
dapp/
├── index.html          # Main HTML page with UI
├── app.js              # JavaScript logic with Ethers.js
├── SimpleStorage.sol   # Sample smart contract
└── README.md           # This file
```

## How to Use

### Step 1: Deploy the Smart Contract

1. Deploy `SimpleStorage.sol` to your preferred network (Hardhat localhost, Sepolia, etc.)
2. Copy the deployed contract address

### Step 2: Update Contract Address

Open `app.js` and update the `CONTRACT_ADDRESS` variable with your deployed contract address:

```javascript
const CONTRACT_ADDRESS = "0xContractAddress";
```

### Step 3: Run the DApp

**Option A: Using Live Server (VS Code)**
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"

**Option B: Using Python**
```bash
cd dapp
python -m http.server 8080
# Open http://localhost:8080 in browser
```

**Option C: Using Node.js**
```bash
npx serve .
# Open the provided URL in browser
```

### Step 4: Interact with DApp

1. Make sure MetaMask is installed and connected to the correct network
2. Click "Connect MetaMask" to connect your wallet
3. Click "Read Contract Value" to read the stored value

## Smart Contract ABI

The DApp is configured to work with contracts that have these functions:
- `get()` - Returns uint256
- `getValue()` - Returns uint256
- `retrieve()` - Returns uint256
- `set(uint256)` - Sets the value


## Screenshots

After running the DApp, take screenshots showing:
1. Initial state (before connecting)
2. After connecting MetaMask
3. After reading contract value

## Technologies Used

- **HTML5** - Page structure
- **CSS3** - Styling
- **JavaScript (ES6)** - Logic
- **Ethers.js v6** - Ethereum library
- **MetaMask** - Wallet connection
- **Solidity** - Smart contract
