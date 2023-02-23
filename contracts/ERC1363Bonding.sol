// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "erc-payable-token/contracts/token/ERC1363/ERC1363.sol";

/// @title A contract for an ERC 1363 Token with a linear bonding curve
/// @author Patrick Zimmerer
/// @notice This contract is to demo a simple ERC1363 token where you can buy and sell bond to a bonding curve
/// @dev When deploying you can choose a token name, symbol and a sellingFee in percent which gets set in the constructor
contract ERC1636Bonding is ERC1363, ERC20Capped, Ownable {
    uint256 public immutable i_sellingFeeInPercent;
    uint256 private constant MAX_SUPPLY = 100_000_000 ether; // ether => shorthand for 18 zeros
    uint256 public constant BASE_PRICE = 0.0001 ether; // shorthand for 18 zeros
    uint256 public constant INCREASE_PRICE_PER_TOKEN = 0.01 gwei; // shorthand for 9 zeros => 10000000 wei or 0.00000000001 ether

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _sellingFeeInPercent
    ) ERC20(_name, _symbol) ERC20Capped(MAX_SUPPLY) {
        i_sellingFeeInPercent = _sellingFeeInPercent;
    }

    /**
     * @notice needs to be overwritten
     */
    function _mint(
        address account,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Capped) {
        super._mint(account, amount);
    }

    /**
     * @notice calculates the price _amount tokens would cost to buy
     */
    function calculateBuyingPrice(
        uint256 _amount
    ) public view returns (uint256) {
        uint256 startingPrice = totalSupply() *
            INCREASE_PRICE_PER_TOKEN +
            BASE_PRICE;
        uint256 endingPrice = (totalSupply() + _amount) *
            INCREASE_PRICE_PER_TOKEN +
            BASE_PRICE;
        uint256 buyingPrice = ((startingPrice + endingPrice) * _amount) / 2;
        return buyingPrice;
    }

    /**
     * @notice calculates the price _amount tokens would get you when you'd sell them
     * @notice as information for the user to know how much eth they will get for _amount tokens
     * @notice also a helper to reduce complexity in _callTokensReceived() / sell function
     * @notice a selling fee which can be set when deploying the contract gets subtracted
     */
    function calculateSellingPrice(
        uint256 _amount
    ) public view returns (uint256) {
        uint256 startingPrice = totalSupply() *
            INCREASE_PRICE_PER_TOKEN +
            BASE_PRICE;
        uint256 endingPrice = (totalSupply() - _amount) *
            INCREASE_PRICE_PER_TOKEN +
            BASE_PRICE;
        uint256 sellingPrice = (((startingPrice + endingPrice) * _amount) / 2);
        sellingPrice =
            sellingPrice -
            (sellingPrice * i_sellingFeeInPercent) /
            100;
        return sellingPrice;
    }

    /**
     * @notice let's a user buy tokens when he sent the right amount of ETH
     */
    function buyTokens(uint256 _amount) external payable {
        // this looks nicer but it would be more gas efficient to check msg.value == calculateBuyingPrice(_amount)
        uint256 buyingPrice = calculateBuyingPrice(_amount);
        require(
            msg.value == buyingPrice,
            "The sent ETH is not the right amount"
        );
        _mint(msg.sender, _amount);
    }

    /**
     * ------------- SELL FUNCTION -----------------
     * @notice Handle the receipt of ERC1363 tokens.
     * @dev Any ERC1363 smart contract calls this function on the recipient
     * Note: the token contract address is always the message sender.
     * @param spender address The address which called `transferAndCall` or `transferFromAndCall` function
     * @param sender address The address which are token transferred from
     * @param amount uint256 The amount of tokens transferred
     * @param data bytes Additional data with no specified format
     * @return `bytes4(keccak256("onTransferReceived(address,address,uint256,bytes)"))` unless throwing
     */
    function onTransferReceived(
        address spender,
        address sender,
        uint256 amount,
        bytes calldata data
    ) external returns (bytes4) {
        _burn(address(this), amount);
        payable(sender).transfer(calculateSellingPrice(amount));
        return
            bytes4(
                keccak256("onTransferReceived(address,address,uint256,bytes)")
            );
    }

    function currentPriceInWei() external view returns (uint256) {
        return BASE_PRICE + (INCREASE_PRICE_PER_TOKEN * totalSupply());
    }

    /**
     * @notice Admin function to withdraw all ETH in the contract
     */
    function adminWithdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
