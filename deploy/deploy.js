const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const name = "ERC1636BondingCoin";
    const symbol = "ERC";

    const arguments = [name, symbol];

    const erc1636BondingCoin = await deploy("ERC1636Bonding", {
        from: deployer,
        args: arguments,
        logs: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // only verify the code when not on development chains as hardhat
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...");
        await verify(erc1636BondingCoin.address, arguments);
    }
    log(
        "erc1636BondingCoin deployed successfully at:",
        erc1636BondingCoin.address
    );
    log("-----------------------------------------");
};

module.exports.tags = ["all", "erc1636BondingCoin"];
