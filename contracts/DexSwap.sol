// SPDX-License-Identifier: GPL-3.0
pragma solidity =0.6.6;

import './DEXswapERC20.sol';

contract DexSwap is DEXswapERC20 {
    constructor(uint _totalSupply) public {
        _mint(msg.sender, _totalSupply);
    }
}
