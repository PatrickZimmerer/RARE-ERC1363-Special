// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "./ERC1363Bonding.sol";

/// @title A contract for an ERC 1363 Token with a linear bonding curve
/// @author Patrick Zimmerer
/// @notice This contract is to demo a simple ERC1363 token where you can buy and sell bond to a bonding curve
/// @dev When deploying you can choose a token name, symbol and a sellingFee in percent which gets set in the constructor

contract ERC1363BondingEchidna {
    ERC1363Bonding tokenContract;
    address echidna;

    event DebugBannedState(uint256);
    event DebugBalance(uint256);
    event EchidnaBalance(uint256);
    event DebugPrices(uint256, uint256, uint256);

    constructor() payable {
        tokenContract = new ERC1363Bonding("TestToken", "TOT", 5);
        echidna = address(this);
    }

    function test_totalSupply() public view {
        assert(tokenContract.totalSupply() <= tokenContract.cap());
    }

    // function test_buyTokens_success(uint256 amount) public {
    //     uint256 initialBalance = tokenContract.balanceOf(address(this));
    //     uint256 initialEtherBalance = address(this).balance;
    //     uint256 initialContractEtherBalance = address(tokenContract).balance;
    //     uint256 buyingPrice = tokenContract.calculateBuyingPrice(amount);
    //     tokenContract.buyTokens{value: buyingPrice}(amount);
    //     assert(
    //         tokenContract.balanceOf(address(this)) == initialBalance + amount
    //     );
    //     assert(address(this).balance == initialEtherBalance - buyingPrice);
    //     assert(
    //         address(tokenContract).balance ==
    //             initialContractEtherBalance + buyingPrice
    //     );
    // }

    // function test_buyPriceGreaterThanSellPrice(uint256 amount) public view {
    //     // optimize the fuzzer to avoid waste of computation
    //     if (amount < 1) {
    //         amount += 1;
    //     }
    //     uint256 buyingPrice = tokenContract.calculateBuyingPrice(amount);
    //     uint256 sellingPrice = tokenContract.calculateSellingPrice(amount);
    //     assert(buyingPrice > sellingPrice);
    // }

    // function test_sellPriceChangeV1(uint256 _amount) public {
    // this doesn't revert
    //     // binds fuzzer toa value between 1 & half of purchaseable tokens since we buy twice
    //     uint256 amount = 1 +
    //         (_amount %
    //             ((tokenContract.cap() - tokenContract.totalSupply() / 2)));
    //     uint256 buyingPrice = tokenContract.calculateBuyingPrice(amount);
    //     tokenContract.buyTokens{value: buyingPrice}(amount);
    //     uint256 startSellingPrice = tokenContract.calculateSellingPrice(amount);
    //     buyingPrice = tokenContract.calculateBuyingPrice(amount);
    //     tokenContract.buyTokens{value: buyingPrice}(amount);
    //     uint256 endSellingPrice = tokenContract.calculateSellingPrice(amount);
    //     assert(startSellingPrice < endSellingPrice);
    // }

    function test_sellPriceChangeV2(uint256 _amount) public {
        // this reverts in some cases
        uint256 buyingPrice = tokenContract.calculateBuyingPrice(100);
        tokenContract.buyTokens{value: buyingPrice}(100);
        // binds fuzzer toa value between 1 & rest of purchaseable tokens
        uint256 amount = 1 +
            (_amount % (tokenContract.cap() - tokenContract.totalSupply()));
        uint256 startSellingPrice = tokenContract.calculateSellingPrice(amount);
        buyingPrice = tokenContract.calculateBuyingPrice(amount);
        tokenContract.buyTokens{value: buyingPrice}(amount);
        uint256 endSellingPrice = tokenContract.calculateSellingPrice(amount);
        assert(startSellingPrice < endSellingPrice);
    }

    function buyPriceIncreases(uint256 amount) public {
        if (amount < 1) {
            amount += 1;
        }
        // this reverts in some cases
        uint256 startBuyingPrice = tokenContract.calculateBuyingPrice(100);
        tokenContract.buyTokens{value: startBuyingPrice}(100);
        uint256 endBuyingPrice = tokenContract.calculateBuyingPrice(amount);
        assert(startBuyingPrice < endBuyingPrice);
    }
}
