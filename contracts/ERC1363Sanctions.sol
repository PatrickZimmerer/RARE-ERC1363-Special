// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC1363Basic.sol";

contract ERC1363Sanctions is ERC1363Basic {
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC1363Basic(_name, _symbol) {}

    function setSanctions() public {}
}
