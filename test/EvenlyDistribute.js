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

  const multipleUsersContribute = async function () {
    await alice.sendTransaction({
      from: alice.address,
      to: evenlyDistribute.address,
      value: ethers.utils.parseEther('25'),
    })
    await bob.sendTransaction({
      from: bob.address,
      to: evenlyDistribute.address,
      value: ethers.utils.parseEther('50'),
    })
    await chris.sendTransaction({
      from: chris.address,
      to: evenlyDistribute.address,
      value: ethers.utils.parseEther('75'),
    })
  }

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
  it("Owner can't change maxContribution to be less than 0.1 ether", async function () {
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
  it('User should be able to check an addresses balance', async function () {
    await bob.sendTransaction({
      from: bob.address,
      to: evenlyDistribute.address,
      value: ethers.utils.parseEther('50'),
    })
    let balance = await evenlyDistribute.checkBalance(bob.address, {from: alice.address})
    expect(balance).to.equal(ethers.utils.parseEther('50'))
  })

    //Is largestContribution accurate?
    it('largestContribution should be accurate', async function () {
      await multipleUsersContribute();
      let res = await evenlyDistribute.largestContribution()
      expect(res).to.equal(ethers.utils.parseEther('75'))
    })

    //Is totalContributions accurate?
    it('totalContributions should be accurate', async function () {
      await multipleUsersContribute();
      let res = await evenlyDistribute.totalContributions()
      expect(res).to.equal(ethers.utils.parseEther('150'))
    })

    //Is totalParticipants accurate?
    it('totalParticipants should be accurate', async function () {
      await multipleUsersContribute();
      let res = await evenlyDistribute.totalParticipants()
      expect(res).to.equal(3)
    })

  // - Can the owner lock the contract?
  it('Owner should be able to lock the contract', async function () {
    await evenlyDistribute.lockContract({from: alice.address})
    let res = await evenlyDistribute.locked()
    expect(res).to.equal(true)
  })

  //regular users should not be able to lock the contract
  it('Owner should be able to lock the contract', async function () {
    await evenlyDistribute.transferOwnership(bob.address, {from: alice.address})
    await assert.revert(
      evenlyDistribute.lockContract({from: alice.address})
    )
  })

  //Owner should not be able to call lock contract if the contract is already locked
  it('Owner should not be able to call lock contract if the contract is already locked', async function () {
    await evenlyDistribute.lockContract({from: alice.address})
    await assert.revert(
      evenlyDistribute.lockContract({from: alice.address})
    )
  })

  //Can users withdraw once the contract is locked?
  it('Users should be able to withdraw funds once the contract is locked', async function () {
    await multipleUsersContribute();
    await evenlyDistribute.lockContract({from: alice.address})
    const balance = await evenlyDistribute.checkBalance(alice.address, {from: alice.address})
    expect(balance).to.equal(ethers.utils.parseEther('25'))
    await evenlyDistribute.withdraw({from: alice.address})
    const newBalance = await evenlyDistribute.checkBalance(alice.address, {from: alice.address})
    expect(newBalance).to.equal(0)
  })

  //Users should not be able to contribute after the game is locked
  it('Users should not be able to contribute funds once the contract is locked', async function () {
    await evenlyDistribute.lockContract({from: alice.address})
    await assert.revert(
      alice.sendTransaction({
        from: alice.address,
        to: evenlyDistribute.address,
        value: ethers.utils.parseEther('25'),
      })
    )
  })

  //Users who did not contribute should not be able to withdraw
  it('Users who did not contribute should not be able to withdraw', async function () {
  await evenlyDistribute.lockContract({from: alice.address})
    await assert.revert(
      evenlyDistribute.withdraw({from: alice.address})
    )
  })

  //Users should not be able to withdraw if the game is unlocked
  it('Users should not be able to withdraw if the game is unlocked', async function () {
    alice.sendTransaction({
      from: alice.address,
      to: evenlyDistribute.address,
      value: ethers.utils.parseEther('25'),
    })
      await assert.revert(
        evenlyDistribute.withdraw({from: alice.address})
      )
    })

  //Is the amount withdrawn correct? 
  //TODO: improve this test
  it('Contract pays out the correct amount of funds', async function () {
    await multipleUsersContribute();
    await evenlyDistribute.lockContract({from: alice.address})
    const aliceBalanceBefore = await alice.getBalance()
    await evenlyDistribute.withdraw({from: alice.address})
    const aliceBalanceAfter = await alice.getBalance()
    assert.bnGt(aliceBalanceAfter, aliceBalanceBefore)
  })

  //lockContractOnTime works after 30 days for non owners to 
  it('Users can call lockContractOnTime 30 days after the game has started if the game is still unlocked', async function () {
    await evenlyDistribute.transferOwnership(chris.address, {from: alice.address})
    let owner = await evenlyDistribute.owner()
    expect(owner).to.equal(chris.address)
    await hre.ethers.provider.send('evm_increaseTime', [30 * 24 * 60 * 60])
    await evenlyDistribute.lockContractOnTime({from: alice.address})
    let isLocked = await evenlyDistribute.locked({from: alice.address})
    expect(isLocked).to.equal(true)
  })

  //lockContractOnTime does not work if a month has not passed
  it('Users cannot call lockContractOnTime if 30 days has not passed since the game has started', async function () {
    await evenlyDistribute.transferOwnership(chris.address, {from: alice.address})
    let owner = await evenlyDistribute.owner()
    expect(owner).to.equal(chris.address)
    await assert.revert(evenlyDistribute.lockContractOnTime({from: alice.address}))
  })

  //resetGame should revert if called less than one week after locking the contract
  it('resetGame should revert if called less than one week after locking the contract', async function () {
    await evenlyDistribute.lockContract({from: alice.address})
    await assert.revert(evenlyDistribute.resetGame({from: alice.address}))
  })
  
  //resetGame works after one week has passed since lock
  it('resetGame works after one week has passed since lock', async function () {
    await evenlyDistribute.lockContract({from: alice.address})
    await hre.ethers.provider.send('evm_increaseTime', [7 * 24 * 60 * 60])
    await evenlyDistribute.resetGame({from: alice.address})
  })
  
  //resetGame resets variables properly
  it('resetGame works after one week has passed since lock', async function () {
    await evenlyDistribute.lockContract({from: alice.address})
    await hre.ethers.provider.send('evm_increaseTime', [7 * 24 * 60 * 60])
    await evenlyDistribute.resetGame({from: alice.address})
    let largestContribution = await evenlyDistribute.largestContribution({from: alice.address})
    let totalParticipants = await evenlyDistribute.totalParticipants({from: alice.address})
    let totalContributions = await evenlyDistribute.totalContributions({from: alice.address})
    let locked = await evenlyDistribute.locked({from: alice.address})
    expect(largestContribution).to.equal(0)
    expect(totalParticipants).to.equal(0)
    expect(totalContributions).to.equal(0)
    expect(locked).to.equal(false)
  })

});

// questions
  // how to change singers? by default I can send contracts from Alice's address, but I get errors if I try and send a contract call from chris