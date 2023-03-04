const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const name = "ERC1363BondingCoin";
    const symbol = "ERC";
    const sellingFeeInPercent = 10;

    const arguments = [name, symbol, sellingFeeInPercent];

    const ERC1363BondingCoin = await deploy("ERC1363Bonding", {
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
        await verify(ERC1363BondingCoin.address, arguments);
    }
    log(
        "ERC1363BondingCoin deployed successfully at:",
        ERC1363BondingCoin.address
    );
    log("-----------------------------------------");
};

module.exports.tags = ["all", "ERC1363BondingCoin"];
