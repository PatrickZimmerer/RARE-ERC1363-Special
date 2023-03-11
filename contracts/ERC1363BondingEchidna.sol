// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "./ERC1363Bonding.sol";

/// @title A contract for an ERC 1363 Token with a linear bonding curve
/// @author Patrick Zimmerer
/// @notice This contract is to demo a simple ERC1363 token where you can buy and sell bond to a bonding curve
/// @dev When deploying you can choose a token name, symbol and a sellingFee in percent which gets set in the constructor
contract ERC1363BondingEchidna is ERC1363Bonding {
    constructor() ERC1363Bonding("TestToken", "TOT", 5) {}
}
