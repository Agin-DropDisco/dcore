const DexSwapV2 = artifacts.require("DexSwapV2");

const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const adminUpgradableAddress = '0x2A627Ae5184cb97f53E10590d540747D0dbAbe1e';

module.exports = async function (deployer, network) {
  if (network !== 'test') {
    await upgradeProxy(adminUpgradableAddress, DexSwapV2, { deployer });
  }
}