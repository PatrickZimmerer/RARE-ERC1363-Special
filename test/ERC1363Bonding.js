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
    const SELLING_FEE = BigNumber.from("5");

    const calculatedSellingPrice = (totalSupply, amount) => {
        const startingPrice = totalSupply
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const endingPrice = totalSupply
            .sub(ethers.utils.parseEther(`${amount}`))
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const expectedSellingPrice = startingPrice
            .add(endingPrice)
            .mul(ethers.utils.parseEther(`${amount}`))
            .div(BigNumber.from("2"))
            .mul(BigNumber.from("100") - SELLING_FEE)
            .div(BigNumber.from("100"));
        return expectedSellingPrice;
    };

    const calculatedBuyingPrice = (totalSupply, amount) => {
        const startingPrice = totalSupply
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const endingPrice = totalSupply
            .add(ethers.utils.parseEther(`${amount}`))
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const expectedBuyingPrice = startingPrice
            .add(endingPrice)
            .mul(ethers.utils.parseEther(`${amount}`))
            .div(BigNumber.from("2"));
        // console.log({ startingPrice, endingPrice, expectedBuyingPrice });
        return expectedBuyingPrice;
    };

    beforeEach(async () => {
        [depl, acc1] = await ethers.getSigners();

        deployer = depl;
        account1 = acc1;

        const ERC1636BondingFactory = await ethers.getContractFactory(
            "ERC1636Bonding"
        );
        erc1363Bonding = await ERC1636BondingFactory.deploy(
            NAME,
            SYMBOL,
            SELLING_FEE
        );
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
        it("should add a users address into the bannedUsers mapping and ban him from buyingTokens", async () => {
            const totalSupply = await erc1363Bonding.totalSupply();
            expect(
                await erc1363Bonding.bannedUsers(account1.address)
            ).to.deep.equal(BigNumber.from("0"));
            const banTx = await erc1363Bonding
                .connect(deployer)
                .banOrUnbanUser(account1.address, BigNumber.from("1"));
            await banTx.wait();
            expect(
                await erc1363Bonding.bannedUsers(account1.address)
            ).to.deep.equal(BigNumber.from("1"));
            await expect(
                erc1363Bonding
                    .connect(account1)
                    .buyTokens(BigNumber.from("10000"), {
                        value: calculatedBuyingPrice(
                            totalSupply,
                            BigNumber.from("10000")
                        ),
                    })
            ).to.be.revertedWith("You are banned");

            const unbanTx = await erc1363Bonding
                .connect(deployer)
                .banOrUnbanUser(account1.address, BigNumber.from("2"));
            await unbanTx.wait();

            const buyTx = await erc1363Bonding
                .connect(account1)
                .buyTokens(BigNumber.from("10000"), {
                    value: calculatedBuyingPrice(
                        totalSupply,
                        BigNumber.from("10000")
                    ),
                });
            await buyTx.wait();
            const userBalance = await erc1363Bonding.balanceOf(
                account1.address
            );
            expect(userBalance).to.deep.equal(BigNumber.from("10000"));
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
            const expectedSellingPrice = calculatedSellingPrice(
                totalSupply,
                BigNumber.from("10")
            );
            // Check that the calculated selling price matches the expected selling price
            expect(sellingPrice).to.deep.equal(expectedSellingPrice);
        });
    });
    describe("calculateBuyingPrice", () => {
        it("should calculate the buying price and increase the price according to the bonding curve", async () => {
            let totalSupply = await erc1363Bonding.totalSupply();
            const buyingPriceStart = await erc1363Bonding.calculateBuyingPrice(
                ethers.utils.parseEther("10")
            );
            console.log("TOTAL SUPPLY START:", totalSupply);
            const expectedBuyingPriceStart = calculatedBuyingPrice(
                totalSupply,
                BigNumber.from("10")
            );
            // Mint 100 tokens to the deployer account to increase the price
            let tx = await erc1363Bonding.mintTokensToAddress(
                deployer.address,
                ethers.utils.parseEther("100")
            );
            await tx.wait();
            // Calculate the buying price for 10 tokens
            // Calculate the expected buying price
            totalSupply = await erc1363Bonding.totalSupply();
            console.log("TOTAL SUPPLY END  :", totalSupply);

            const buyingPriceEnd = await erc1363Bonding.calculateBuyingPrice(
                ethers.utils.parseEther("10")
            );
            const expectedBuyingPriceEnd = calculatedBuyingPrice(
                totalSupply,
                BigNumber.from("10")
            );
            console.log("EXPECTED BUYING PRICE START:", expectedBuyingPriceEnd);
            console.log("buyingPriceStart should be :", buyingPriceEnd);

            console.log("EXPECTED BUYING PRICE END  :", expectedBuyingPriceEnd);
            console.log("buyingPriceEnd should be   :", buyingPriceEnd);
            // Check that the calculated buying price matches the expected buying price
            expect(buyingPriceStart).to.deep.equal(expectedBuyingPriceStart);
            expect(buyingPriceEnd).to.deep.equal(expectedBuyingPriceEnd);
            expect(buyingPriceEnd).to.be.greaterThan(buyingPriceStart);
        });
    });
});
