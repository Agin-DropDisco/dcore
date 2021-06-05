module.exports.reasonRevert = {
    onlyOwner            : "Ownable: caller is not the owner",
    cantTransfer         : "DexSwap: your DEXS can't transfer right now",
    lockOverBalance      : "DexSwap: lock amount over blance",
    mintOverCap          : "ERC20Capped: cap exceeded",
    accessWhitelist      : "WhitelistRole: Caller is not a whitelist role",
    accessBurn           : "ERC20: burn amount exceeds allowance",
    setAllowTransferOn   : "DexSwap: invalid new allowTransferOn"
}