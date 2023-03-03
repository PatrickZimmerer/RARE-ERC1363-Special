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
    uint256 public constant INCREASE_PRICE_PER_TOKEN = 2 wei; // shorthand for 9 zeros => 10000000 wei or 0.00000000001 ether
    mapping(address => uint256) public bannedUsers; // using uint instead of bool to reduce gas cost

    /**
     * @notice Custom Modifier to check if a user is banned
     */
    modifier onlyUnbanned() {
        require(bannedUsers[msg.sender] != 1, "You are banned");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _sellingFeeInPercent
    ) ERC20(_name, _symbol) ERC20Capped(MAX_SUPPLY) {
        i_sellingFeeInPercent = _sellingFeeInPercent;
    }

    /**
     * @notice Only admin can ban/unban users from using the contract
     * @dev If you want to ban a User pass in the number 1 if you want to unban the user
     * @dev it is recommended to pass in a number > 1 like 2 since setting
     * @dev a non-zero to a non-zero value costs only 5000 gas instead of 20_000gas
     */
    function banOrUnbanUser(
        address _userAddress,
        uint256 _banStatus
    ) external onlyOwner {
        bannedUsers[_userAddress] = _banStatus;
    }

    /**
     * @notice Admin function to transfer tokens between addresses at will
     * @param _from Address to transfer tokens from
     * @param _to Address to transfer tokens to
     * @param _amount Amount of tokens to transfer
     */
    function onlyAdminTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        _transfer(_from, _to, _amount);
    }

    /**
     * @notice Admin function to withdraw all ETH in the contract
     */
    function adminWithdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @notice Mints "amount" of tokens to "recipient".
     * @dev this minting increases the supply.
     * @param recipient the recipient to mint additional tokens for.
     * @param amount the amount of wTokens to mint (note: *not* Tokens). The overall supply will be increased by this amount.
     */
    function mintTokensToAddress(
        address recipient,
        uint256 amount
    ) external onlyOwner {
        _mint(recipient, amount); // mint amount of wTokens and send to recipient
    }

    /**
     * @notice let's a user buy tokens when he sent the right amount of ETH
     */
    function buyTokens(uint256 _amount) external payable onlyUnbanned {
        // this looks nicer but it would be more gas efficient to require msg.value == calculateBuyingPrice(_amount)
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
     * @return `bytes4(keccak256("onTransferReceived(address,address,uint256,bytes)"))` unless throwing
     */
    function onTransferReceived(
        address spender,
        address sender,
        uint256 amount,
        bytes calldata
    ) external returns (bytes4) {
        require(
            bannedUsers[spender] != 1,
            "The address you are trying to send from is banned"
        );
        require(
            bannedUsers[sender] != 1,
            "The address you are trying to send to is banned"
        );
        _burn(address(this), amount);
        payable(sender).transfer(calculateSellingPrice(amount));
        return
            bytes4(
                keccak256("onTransferReceived(address,address,uint256,bytes)")
            );
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
     * @notice Just shows if a specific address is banned from using the token
     */
    function showBannedStatus(
        address _address
    ) external view returns (uint256) {
        return bannedUsers[_address];
    }

    function currentPriceInWei() external view returns (uint256) {
        return BASE_PRICE + (INCREASE_PRICE_PER_TOKEN * totalSupply());
    }

    /**
     * @notice Checks if one of the addresses is banned by the admin
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting as well as burning.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(
            bannedUsers[from] != 1,
            "The address you are trying to send from is banned"
        );
        require(
            bannedUsers[to] != 1,
            "The address you are trying to send to is banned"
        );
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @notice needs to be overwritten
     */
    function _mint(
        address account,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Capped) onlyUnbanned {
        super._mint(account, amount);
    }
}
