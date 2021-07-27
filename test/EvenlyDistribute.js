const { expect } = require("chai");

describe("EvenlyDistribute contract", function () {
  it("Deployment should work and assign owner", async function () {
    const [owner] = await ethers.getSigners();
    
    const EvenlyDistribute = await ethers.getContractFactory("EvenlyDistribute");

    console.log('meow')
    // console.log('owner: ', owner)

    const evenlyDistribute = await EvenlyDistribute.deploy();

    const contractOwner = await evenlyDistribute.owner();
    expect(owner.address).to.equal(contractOwner);
  });
});