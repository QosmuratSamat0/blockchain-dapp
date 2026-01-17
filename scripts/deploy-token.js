const hre = require("hardhat");

async function main() {
    console.log("Deploying MyToken contract...");

    // Deploy with initial supply of 1,000,000 tokens
    const initialSupply = 1000000;
    
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy(initialSupply);

    await token.waitForDeployment();

    const address = await token.getAddress();
    console.log("MyToken deployed to:", address);

    // Get token info
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    
    console.log("Token Name:", name);
    console.log("Token Symbol:", symbol);
    console.log("Total Supply:", hre.ethers.formatUnits(totalSupply, 18), symbol);

    console.log("\nDeployment complete!");
    console.log("Update TOKEN_ADDRESS in token-app.js with:", address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
