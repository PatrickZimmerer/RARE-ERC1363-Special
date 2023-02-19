// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "../node_modules/erc-payable-token/contracts/token/ERC1363/ERC1363.sol";

contract ERC1636Bonding is ERC1363, ERC20Capped {
    address immutable i_owner;
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;

    constructor() ERC20("EasyCoin", "ESC") ERC20Capped(MAX_SUPPLY) {
        i_owner = msg.sender;
        _mint(msg.sender, 1_000_000 * 10 ** uint256(decimals()));
    }

    function adminWithdraw() external {
        require(i_owner == msg.sender, "not the owner");
        payable(msg.sender).transfer(address(this).balance);
    }

    function _mint(
        address account,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Capped) {
        super._mint(account, amount);
    }
}
