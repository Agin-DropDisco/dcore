// SPDX-License-Identifier: GPL-3.0
pragma solidity =0.5.16;

import './interfaces/IDEXswapFactory.sol';

contract DEXswapFeeSetter {
    address public owner;
    mapping(address => address) public pairOwners;
    IDEXswapFactory public factory;
  
    constructor(address _owner, address _factory) public {
        owner = _owner;
        factory = IDEXswapFactory(_factory);
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, 'DEXswapFeeSetter: FORBIDDEN');
        owner = newOwner;
    }
    
    function transferPairOwnership(address pair, address newOwner) external {
        require(msg.sender == owner, 'DEXswapFeeSetter: FORBIDDEN');
        pairOwners[pair] = newOwner;
    }

    function setFeeTo(address feeTo) external {
        require(msg.sender == owner, 'DEXswapFeeSetter: FORBIDDEN');
        factory.setFeeTo(feeTo);
    }

    function setFeeToSetter(address feeToSetter) external {
        require(msg.sender == owner, 'DEXswapFeeSetter: FORBIDDEN');
        factory.setFeeToSetter(feeToSetter);
    }
    
    function setProtocolFee(uint8 protocolFeeDenominator) external {
        require(msg.sender == owner, 'DEXswapFeeSetter: FORBIDDEN');
        factory.setProtocolFee(protocolFeeDenominator);
    }
    
    function setSwapFee(address pair, uint32 swapFee) external {
        require((msg.sender == owner) || ((msg.sender == pairOwners[pair])), 'DEXswapFeeSetter: FORBIDDEN');
        factory.setSwapFee(pair, swapFee);
    }
}
