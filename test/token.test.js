const DexSwap = artifacts.require('DexSwap')
const BigNumber = require('bn.js')
var BN = (s) => new BigNumber(s.toString(), 10)
const reasonRevert = require("../constants/exceptions.js").reasonRevert;
const { deployProxy } = require('@openzeppelin/truffle-upgrades');


const {
  expectRevert
} = require('@openzeppelin/test-helpers');

contract('DexSwap', ([owner, alice, bob]) => {
  beforeEach(async () => {
    // Deploy DEXS token
    this.dexsToken = await deployProxy(DexSwap, [1, 1000], {
      initializer: '__DexSwap_init',
    })
  })

  describe('# mint', async () => {
    it('mint 1000 dexs token by owner', async () => {
      await this.dexsToken.mint(alice, 1000, {from: owner})
      assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 1000)
    })

    it('mint 1000 dexs token not by owner', async () => {
      await expectRevert(this.dexsToken.mint(
        alice,
        1000,
        { from: alice }
      ), reasonRevert.onlyOwner)
    })
    
    it('mint over cap', async () => {
      await expectRevert(this.dexsToken.mint(
        alice,
        BN(100000000).mul(BN(Math.pow(10,19))).toString(),
        { from: owner }  
      ), reasonRevert.mintOverCap)
    })
  })

  describe('# burn', async () => {
    beforeEach(async () => {
      // Mint 1000 DEXS tokens
      await this.dexsToken.mint(alice, 1000, {from: owner})
    })

    it('mint 1000 & burn 200', async () => {
      await this.dexsToken.burn(200, {from: alice})
      assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 800)
    })

    it('mint 1000 & burn 200 when not access', async () => {
      await expectRevert(this.dexsToken.burnFrom(
        alice,
        200,
        { from: owner }  
      ), reasonRevert.accessBurn)
    })

    it('mint 1000 & burn 200 when owner burn', async () => {
      await this.dexsToken.approve(owner, 1000, {from: alice})
      await this.dexsToken.burnFrom(alice, 200, {from: owner})
      assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 800)
    })
  })

  describe('# lock', async () => {
    beforeEach(async () => {
      // Mint 1000 DEXS tokens
      await this.dexsToken.mint(alice, 1000, {from: owner})
    })

    it('lock fail when allow transfer on not yet', async () => {
      await expectRevert(this.dexsToken.lock(
        alice,
        750,
        { from: owner }  
      ), reasonRevert.cantTransfer)
    })

    it('lock fail when lock over balance', async () => {
      // Set allow transfer on
      await expectRevert(this.dexsToken.lock(
        alice,
        1200,
        { from: owner }  
      ), reasonRevert.lockOverBalance)
    })

    it('mint 1000 & lock 750 dexs token by owner', async () => {
      // Set allow transfer on
      await this.dexsToken.setAllowTransferOn(1, {from: owner})
      // Lock 750 DEXS tokens of alice
      await this.dexsToken.lock(alice, 750, {from: owner})
      // Balance available
      assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 250)
      // Balance lock
      assert.equal((await this.dexsToken.lockOf(alice)).valueOf(), 750)
      // Balance total balance
      assert.equal((await this.dexsToken.totalBalanceOf(alice)).valueOf(), 1000)
    })

    it('mint 1000 & lock 750 dexs token not by owner', async () => {
      await expectRevert(this.dexsToken.lock(
        alice,
        750,
        { from: alice }  
      ), reasonRevert.onlyOwner)
    })
  })

  describe('# white list', async () => {
    beforeEach(async () => {
      // Mint 1000 DEXS tokens
      await this.dexsToken.mint(alice, 1000, {from: owner})
    })

    it('lock fail when user not in white list and allow transfer on not yet', async () => {
      await expectRevert(this.dexsToken.lock(
        alice,
        750,
        { from: owner }  
      ), reasonRevert.cantTransfer)
    })

    it('lock ok when user in white list and allow transfer on not yet', async () => {
      await this.dexsToken.addWhitelist(alice)
      await this.dexsToken.lock(alice, 750, {from: owner})
      // Balance available
      assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 250)
      // Balance lock
      assert.equal((await this.dexsToken.lockOf(alice)).valueOf(), 750)
      // Balance total balance
      assert.equal((await this.dexsToken.totalBalanceOf(alice)).valueOf(), 1000)
    })

    it('lock fail when user was removed from whitelist by admin', async () => {
      await this.dexsToken.addWhitelist(alice, {from: owner})
      await this.dexsToken.lock(alice, 750, {from: owner})
      // Balance available
      assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 250)
      // Balance lock
      assert.equal((await this.dexsToken.lockOf(alice)).valueOf(), 750)
      // Balance total balance
      assert.equal((await this.dexsToken.totalBalanceOf(alice)).valueOf(), 1000)
      await this.dexsToken.revokeWhitelist(alice, { from: owner })
      await expectRevert(this.dexsToken.lock(
        alice,
        100,
        { from: owner }  
      ), reasonRevert.cantTransfer)
    })

    it('lock fail when user was removed from whitelist by self', async () => {
      await this.dexsToken.addWhitelist(alice, {from: owner})
      await this.dexsToken.lock(alice, 750, {from: owner})
      // Balance available
      assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 250)
      // Balance lock
      assert.equal((await this.dexsToken.lockOf(alice)).valueOf(), 750)
      // Balance total balance
      assert.equal((await this.dexsToken.totalBalanceOf(alice)).valueOf(), 1000)
      await this.dexsToken.renounceWhitelist({ from: alice })
      await expectRevert(this.dexsToken.lock(
        alice,
        100,
        { from: owner }  
      ), reasonRevert.cantTransfer)
    })

    it('renounce whitelist fail when user was not in whitelist renounce whitelist', async () => {
      await expectRevert(this.dexsToken.renounceWhitelist({ from: alice }), reasonRevert.accessWhitelist)
    })
  })

  describe('# allow transfer on', async () => {
    beforeEach(async () => {
      // Mint 1000 DEXS tokens
      await this.dexsToken.mint(alice, 1000, {from: owner})
    })

    it('not transfer', async () => {
      await expectRevert(this.dexsToken.transfer(
        bob,
        250,
        { from: alice }  
      ), reasonRevert.cantTransfer)
    })

    it('not set allowTransferOn', async () => {
      await expectRevert(
        this.dexsToken.setAllowTransferOn(12743799, {from: owner}
      ), reasonRevert.setAllowTransferOn)
    })

    it('can transfer', async () => {
      await this.dexsToken.setAllowTransferOn(1, {from: owner})
      await this.dexsToken.transfer(bob, 250, { from: alice })
       // Balance alice
       assert.equal((await this.dexsToken.balanceOf(alice)).valueOf(), 750)
       // Balance bob
       assert.equal((await this.dexsToken.balanceOf(bob)).valueOf(), 250)
    })
  })

})