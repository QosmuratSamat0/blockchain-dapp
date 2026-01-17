const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleStorage contract...");

  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.waitForDeployment();

  const address = await simpleStorage.getAddress();
  console.log("SimpleStorage deployed to:", address);

  // Set an initial value
  const tx = await simpleStorage.set(42);
  await tx.wait();
  console.log("Initial value set to: 42");

  // Verify the value
  const value = await simpleStorage.get();
  console.log("Current value:", value.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
