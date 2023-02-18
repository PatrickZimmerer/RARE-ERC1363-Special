// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// QUESTION: Jeffrey said he's not a big fan of Ownable from Openzeppelin because you can fuck up things
//           should we rather use i_deployer = msg.sender in constructor and then just put the require(i_deployer)
//           in a new modifier, what's best practice?
// QUESTION: When to use lower uints like uin8? Jeffrey said in a video that lower uints get streamed to uint256
//           when reading from storage => user has to pay more gas, so what usecases are there for lower uints?

import {ERC20Capped, ERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import {IERC1363} from "../node_modules/erc-payable-token/contracts/token/ERC1363/ERC1363.sol";

contract ERC1363Capped is ERC20Capped, IERC1363, ERC165 {
    uint8 public constant DECIMALS = 18;
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) ERC20Capped(MAX_SUPPLY) {}
}
