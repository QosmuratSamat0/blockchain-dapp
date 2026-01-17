const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let token, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy(1000);
    await token.waitForDeployment();
  });

  it("assigns total supply to owner", async function () {
    expect(await token.balanceOf(owner.address)).to.equal(await token.totalSupply());
  });

  it("transfers tokens between accounts", async function () {
    await token.transfer(addr1.address, 100);
    expect(await token.balanceOf(addr1.address)).to.equal(100);
  });

  it("fails if sender doesn’t have enough", async function () {
    await expect(token.connect(addr1).transfer(owner.address, 1)).to.be.reverted;
  });

  it("allows transfer to self", async function () {
    await token.transfer(owner.address, 10);
    expect(await token.balanceOf(owner.address)).to.equal(await token.totalSupply());
  });

  it("estimates gas for transfer", async function () {
    const gas = await token.transfer.estimateGas(addr1.address, 10);
    expect(gas).to.be.a("object");
  });

  it("emits Transfer event", async function () {
    await expect(token.transfer(addr1.address, 10))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, addr1.address, 10);
  });

  it("reverts on invalid transfer (zero address)", async function () {
    await expect(token.transfer(ethers.ZeroAddress, 10)).to.be.reverted;
  });
});
