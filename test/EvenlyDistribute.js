const { expect } = require("chai");

describe("EvenlyDistribute contract", function () {

  let alice;
  let bob;
  let chris;
  let EvenlyDistribute
  let evenlyDistribute;

  beforeEach ( async () => {
    [a, b, c] = await ethers.getSigners();

    alice = a;
    bob = b;
    chris = c;
  
    EvenlyDistribute = await ethers.getContractFactory("EvenlyDistribute");

    evenlyDistribute = await EvenlyDistribute.deploy();

  });

  //Does the contract have an owner?
  it("Contract should assign owner", async function () {
    const contractOwner = await evenlyDistribute.owner();
    expect(alice.address).to.equal(contractOwner);
  });

  //Can the owner transfer ownership to another address?
  it("Owner can transfer ownership", async function () {
    
    const contractOwner = await evenlyDistribute.owner();
    expect(owner.address).to.equal(contractOwner);
  });
  // - Can the owner change maxContribution?
  //     - Owner shouldn't be able to set maxContribution to less than largestContribution
  //     - Owner shouldn't be able to set maxContribution to be smaller than 0.1 ether
  // - Can users contribute to the contract?
  // - Users cannot contribute more than maxContribution
  // - Can a user check their balance?
  // - Can multiple users contribute to the contract?
  //     - Is largestContribution accurate?
  //     - Is totalContributions accurate?
  //     - Is totalParticipants accurate?
  // - Can the owner lock the contract?
  //     - regular users should not be able to lock the contract
  //     - Owner should not be able to call lock contract if the contract is already locked
  // - Can users withdraw once the contract is locked?
  //     - Users who did not contribute should not be able to withdraw
  //     - User should not be able to withdraw if the game is locked
  //     - Is the amount withdrawn correct?
  //     - 
  // - Find out how to test time based mechanics
  //     - e.g. lockContractOnTime & resetGame functions

});