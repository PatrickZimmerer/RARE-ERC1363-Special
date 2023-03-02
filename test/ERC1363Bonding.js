const { assert, expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("ERC1363Bonding", () => {
    let erc1363Bonding;
    let deployer;
    let account1;

    const NAME = "Test Token";
    const SYMBOL = "TEST";

    const INCREASE_PRICE_PER_TOKEN = ethers.utils.parseUnits("0.01", "gwei");
    const BASE_PRICE = ethers.utils.parseEther("0.0001");

    beforeEach(async () => {
        [depl, acc1] = await ethers.getSigners();

        deployer = depl;
        account1 = acc1;

        const ERC1636BondingFactory = await ethers.getContractFactory(
            "ERC1636Bonding"
        );
        erc1363Bonding = await ERC1636BondingFactory.deploy(NAME, SYMBOL, 5);
        await erc1363Bonding.deployed();
    });
    describe("constructor", () => {
        it("should deploy to an address", async () => {
            expect(await erc1363Bonding.address).to.not.be.null;
            expect(await erc1363Bonding.address).to.be.ok;
        });

        it("should set the selling fee, name and symbol when deployed", async () => {
            expect(await erc1363Bonding.i_sellingFeeInPercent()).to.deep.equal(
                BigNumber.from("5")
            );
            expect(await erc1363Bonding.name()).to.equal(NAME);
            expect(await erc1363Bonding.symbol()).to.equal(SYMBOL);
        });
    });
    describe("banOrUnbanUser", () => {
        it("should add a users address into the bannedUsers mapping", async () => {
            expect(
                await erc1363Bonding.bannedUsers(account1.address)
            ).to.deep.equal(BigNumber.from("0"));
            const tx = await erc1363Bonding
                .connect(deployer)
                .banOrUnbanUser(account1.address, BigNumber.from("1"));
            await tx.wait();
            expect(
                await erc1363Bonding.bannedUsers(account1.address)
            ).to.deep.equal(BigNumber.from("1"));
        });
        it("should revert since caller is not owner", async () => {
            await expect(
                erc1363Bonding
                    .connect(account1)
                    .banOrUnbanUser(deployer.address, BigNumber.from("1"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("calculateSellingPrice", () => {
        it("should calculate the selling price and return", async () => {
            const SELLING_FEE = await erc1363Bonding.i_sellingFeeInPercent();
            // Mint 100 tokens to the deployer account
            let tx = await erc1363Bonding.mintTokensToAddress(
                deployer.address,
                ethers.utils.parseEther("100")
            );
            await tx.wait();
            // Calculate the selling price for 10 tokens
            const sellingPrice = await erc1363Bonding.calculateSellingPrice(
                ethers.utils.parseEther("10")
            );
            // Calculate the expected selling price
            const totalSupply = await erc1363Bonding.totalSupply();
            const startingPrice = totalSupply
                .mul(INCREASE_PRICE_PER_TOKEN)
                .add(BASE_PRICE);
            const endingPrice = totalSupply
                .sub(ethers.utils.parseEther("10"))
                .mul(INCREASE_PRICE_PER_TOKEN)
                .add(BASE_PRICE);
            const expectedSellingPrice = startingPrice
                .add(endingPrice)
                .mul(ethers.utils.parseEther("10"))
                .div(BigNumber.from(2))
                .mul(BigNumber.from(100) - SELLING_FEE)
                .div(BigNumber.from(100));
            // Check that the calculated selling price matches the expected selling price
            expect(sellingPrice).to.deep.equal(expectedSellingPrice);
        });
    });
});
