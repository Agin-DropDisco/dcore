
// migrations/2_transfer_ownership.js
const { admin } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, network) {
  // Use address of your Gnosis Safe
  const gnosisSafe = '0xBfBa42de8147de1B20731bD8150531c50cd10803';
  // 0x127fAC9bA0950D331975225ea0eC4266c85330d5

  // Don't change ProxyAdmin ownership for our test network
  if (network !== 'test') {
    // The owner of the ProxyAdmin can upgrade our contracts
    await admin.transferProxyAdminOwnership(gnosisSafe);
  }
}