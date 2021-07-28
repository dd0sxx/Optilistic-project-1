const { expect } = require("chai")
const { assert } = require('./utils')

describe("EvenlyDistribute contract", function () {

  let alice
  let bob
  let chris
  let EvenlyDistribute
  let evenlyDistribute

  beforeEach ( async () => {
    [a, b, c] = await ethers.getSigners()

    alice = a
    bob = b
    chris = c
  
    EvenlyDistribute = await ethers.getContractFactory("EvenlyDistribute")

    evenlyDistribute = await EvenlyDistribute.deploy()

  })

  //Does the contract have an owner?
  it("Contract should assign owner", async function () {
    const contractOwner = await evenlyDistribute.owner()
    expect(alice.address).to.equal(contractOwner)
  });

  //Can the owner transfer ownership to another address?
  it("Owner can transfer ownership", async function () {
    // console.log(Ev)
    await evenlyDistribute.transferOwnership(bob.address, {from: alice.address})
    const contractOwner = await evenlyDistribute.owner()
    expect(bob.address).to.equal(contractOwner)
  })

  //Can the owner change maxContribution?
  it("Owner can change maxContribution", async function () {
    let initMax = await evenlyDistribute.maxContribution()
    expect(initMax).to.equal(ethers.utils.parseEther('100'))
    await evenlyDistribute.updateMax(ethers.utils.parseEther('50'), {from: alice.address})
    let newMax = await evenlyDistribute.maxContribution()
    expect(newMax).to.equal(ethers.utils.parseEther('50'))
  })
  
  //Owner shouldn't be able to set maxContribution to be smaller than 0.1 ether
  it("Owner can't change maxContribution to be less than 0.1 ether'", async function () {
    await assert.revert(
      evenlyDistribute.updateMax(ethers.utils.parseEther('0.01'), {from: alice.address})
    )
  })
  
  //Can users contribute to the contract?
  it('Users should be able to contribute to the contract', async function () {
    let res = true;
    try {
      await bob.sendTransaction({
        from: bob.address,
        to: evenlyDistribute.address,
        value: ethers.utils.parseEther('2'),
      })
    } catch {
      res = false;
    }
    expect(res).to.equal(true);
  })

  //Users cannot contribute more than maxContribution
  it('Users should not be able to contribute more than maxContribution', async function () {
    await assert.revert(
      bob.sendTransaction({
        from: bob.address,
        to: evenlyDistribute.address,
        value: ethers.utils.parseEther('120'),
      })
    )
  })
  //Owner shouldn't be able to set maxContribution to less than largestContribution
  it("Owner can't change maxContribution to be less than largestContribution", async function () {
    await bob.sendTransaction({
      from: bob.address,
      to: evenlyDistribute.address,
      value: ethers.utils.parseEther('50'),
    })
    await assert.revert(
      evenlyDistribute.updateMax(ethers.utils.parseEther('20'), {from: alice.address})
    )
  });

  //Can a user check their balance?
  it('User should be able to check their balance', async function () {
    await bob.sendTransaction({
      from: bob.address,
      to: evenlyDistribute.address,
      value: ethers.utils.parseEther('50'),
    })
    let balance = await evenlyDistribute.checkBalance(bob.address, {from: alice.address})
    expect(balance).to.equal(ethers.utils.parseEther('50'))
  })

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