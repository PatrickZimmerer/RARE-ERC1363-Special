const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("ERC1363Bonding", () => {
    let erc1363Bonding;
    let deployer;
    let account1;

    const NAME = "Test Token";
    const SYMBOL = "TEST";

    const INCREASE_PRICE_PER_TOKEN = ethers.utils.parseUnits("2", "wei");
    const BASE_PRICE = ethers.utils.parseEther("0.0001");
    const SELLING_FEE = BigNumber.from("5");

    const SMALL_AMOUNT_OF_ETH = ethers.utils.parseEther("0.0001");

    const calculatedSellingPrice = (totalSupply, amount) => {
        const startingPrice = totalSupply
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const endingPrice = totalSupply
            .sub(BigNumber.from(amount))
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const expectedSellingPrice = startingPrice
            .add(endingPrice)
            .mul(BigNumber.from(amount))
            .div(BigNumber.from("2"))
            .mul(BigNumber.from("100") - SELLING_FEE)
            .div(BigNumber.from("100"));
        return expectedSellingPrice;
    };

    function calculatedBuyingPrice(totalSupply, amount) {
        const startingPrice = totalSupply
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const endingPrice = totalSupply
            .add(BigNumber.from(amount))
            .mul(INCREASE_PRICE_PER_TOKEN)
            .add(BASE_PRICE);
        const expectedBuyingPrice = startingPrice
            .add(endingPrice)
            .div(BigNumber.from("2"))
            .mul(BigNumber.from(amount));
        return expectedBuyingPrice;
    }

    beforeEach(async () => {
        [depl, acc1] = await ethers.getSigners();

        deployer = depl;
        account1 = acc1;

        const ERC1363BondingFactory = await ethers.getContractFactory(
            "ERC1363Bonding"
        );
        erc1363Bonding = await ERC1363BondingFactory.deploy(
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
            expect(await erc1363Bonding.SELLING_FEE_IN_PERCENT()).eq(
                BigNumber.from("5")
            );
            expect(await erc1363Bonding.name()).to.equal(NAME);
            expect(await erc1363Bonding.symbol()).to.equal(SYMBOL);
        });
    });
    describe("banOrUnbanUser", () => {
        it("should add a users address into the bannedUsers mapping and ban him from buyingTokens", async () => {
            const totalSupply = await erc1363Bonding.totalSupply();
            const banTx = await erc1363Bonding.banOrUnbanUser(
                account1.address,
                BigNumber.from("1")
            );
            await banTx.wait();
            expect(await erc1363Bonding.bannedUsers(account1.address)).eq(
                BigNumber.from("1")
            );
            await expect(
                erc1363Bonding
                    .connect(account1)
                    .buyTokens(BigNumber.from("1000"), {
                        value: calculatedBuyingPrice(
                            totalSupply,
                            BigNumber.from("1000")
                        ),
                    })
            ).to.be.revertedWith("You are banned");
            const unbanTx = await erc1363Bonding.banOrUnbanUser(
                account1.address,
                BigNumber.from("2")
            );
            await unbanTx.wait();
            const buyTx = await erc1363Bonding
                .connect(account1)
                .buyTokens(BigNumber.from("1000"), {
                    value: calculatedBuyingPrice(
                        totalSupply,
                        BigNumber.from("1000")
                    ),
                });
            await buyTx.wait();
            const userBalance = await erc1363Bonding.balanceOf(
                account1.address
            );

            expect(userBalance).eq(BigNumber.from("1000"));
        });
        it("should revert since caller is not owner", async () => {
            await expect(
                erc1363Bonding
                    .connect(account1)
                    .banOrUnbanUser(deployer.address, BigNumber.from("1"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("onlyAdminTransfer", () => {
        it("should allow the owner to move tokens between addresses at will", async () => {
            const mintTx = await erc1363Bonding.mintTokensToAddress(
                account1.address,
                BigNumber.from("100")
            );
            await mintTx.wait();
            expect(await erc1363Bonding.balanceOf(deployer.address)).eq(
                BigNumber.from("0")
            );
            expect(await erc1363Bonding.balanceOf(account1.address)).eq(
                BigNumber.from("100")
            );
            const transferTx = await erc1363Bonding.onlyAdminTransfer(
                account1.address,
                deployer.address,
                BigNumber.from("100")
            );
            transferTx.wait();

            expect(await erc1363Bonding.balanceOf(deployer.address)).eq(
                BigNumber.from("100")
            );
            expect(await erc1363Bonding.balanceOf(account1.address)).eq(
                BigNumber.from("0")
            );
        });
        it("should revert the onlyAdminTransfer since caller is not owner", async () => {
            await expect(
                erc1363Bonding
                    .connect(account1)
                    .onlyAdminTransfer(
                        deployer.address,
                        account1.address,
                        BigNumber.from("10")
                    )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("adminWithdraw", () => {
        it("should allow the owner to withdraw the balance of the contract", async () => {
            const startingBalance = await ethers.provider.getBalance(
                deployer.address
            );
            const totalSupply = await erc1363Bonding.totalSupply();
            const buyTx = await erc1363Bonding
                .connect(account1)
                .buyTokens(BigNumber.from("1000"), {
                    value: calculatedBuyingPrice(
                        totalSupply,
                        BigNumber.from("1000")
                    ),
                });
            await buyTx.wait();
            const contractBalance = await ethers.provider.getBalance(
                erc1363Bonding.address
            );
            expect(contractBalance).eq(
                calculatedBuyingPrice(totalSupply, BigNumber.from("1000"))
            );
            const withdrawTx = await erc1363Bonding.adminWithdraw();
            withdrawTx.wait();
            expect(await ethers.provider.getBalance(erc1363Bonding.address)).eq(
                BigNumber.from("0")
            );
            const endingBalance = startingBalance.add(
                calculatedBuyingPrice(totalSupply, BigNumber.from("1000"))
            );

            expect(
                await ethers.provider.getBalance(deployer.address)
            ).to.be.closeTo(endingBalance, SMALL_AMOUNT_OF_ETH);
        });
        it("should revert the adminWithdraw since caller is not owner", async () => {
            await expect(
                erc1363Bonding.connect(account1).adminWithdraw()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("mintTokensToAddress", () => {
        it("should allow the owner to mint tokens to any addresses for free (just gas)", async () => {
            expect(await erc1363Bonding.balanceOf(account1.address)).eq(
                BigNumber.from("0")
            );
            const mintTx = await erc1363Bonding.mintTokensToAddress(
                account1.address,
                BigNumber.from("100")
            );
            await mintTx.wait();

            expect(await erc1363Bonding.balanceOf(account1.address)).eq(
                BigNumber.from("100")
            );
        });
        it("should revert the mintTokensToAddress since caller is not owner", async () => {
            await expect(
                erc1363Bonding
                    .connect(account1)
                    .mintTokensToAddress(
                        account1.address,
                        BigNumber.from("100")
                    )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should revert the mintTokensToAddress since receiver is banned", async () => {
            const banTx = await erc1363Bonding.banOrUnbanUser(
                account1.address,
                BigNumber.from("1")
            );
            await banTx.wait();

            await expect(
                erc1363Bonding.mintTokensToAddress(
                    account1.address,
                    BigNumber.from("100")
                )
            ).to.be.revertedWith(
                "The address you are trying to send to is banned"
            );
        });
    });
    describe("buyTokens", () => {
        it("should allow a user to buy tokens", async () => {
            const totalSupply = await erc1363Bonding.totalSupply();
            expect(await erc1363Bonding.balanceOf(account1.address)).eq(
                BigNumber.from("0")
            );
            const buyTx = await erc1363Bonding
                .connect(account1)
                .buyTokens(BigNumber.from("1000"), {
                    value: calculatedBuyingPrice(
                        totalSupply,
                        BigNumber.from("1000")
                    ),
                });
            await buyTx.wait();
            const userBalance = await erc1363Bonding.balanceOf(
                account1.address
            );

            expect(userBalance).eq(BigNumber.from("1000"));
        });
        it("should revert since the value sent is not the right amount", async () => {
            const totalSupply = await erc1363Bonding.totalSupply();

            await expect(
                erc1363Bonding
                    .connect(account1)
                    .buyTokens(BigNumber.from("1000"), {
                        value: calculatedBuyingPrice(
                            totalSupply,
                            BigNumber.from("9999")
                        ),
                    })
            ).to.be.revertedWith("The sent ETH is not the right amount");
        });
        it("should revert since the address the token gets sent from is banned", async () => {
            const mintTx = await erc1363Bonding.mintTokensToAddress(
                account1.address,
                BigNumber.from("100")
            );
            await mintTx.wait();
            const banTx = await erc1363Bonding.banOrUnbanUser(
                account1.address,
                BigNumber.from("1")
            );
            await banTx.wait();

            await expect(
                erc1363Bonding
                    .connect(account1)
                    .transfer(deployer.address, BigNumber.from("100"))
            ).to.be.revertedWith(
                "The address you are trying to send from is banned"
            );
        });
        it("should allow to transfer tokens to another address", async () => {
            const mintTx = await erc1363Bonding.mintTokensToAddress(
                account1.address,
                BigNumber.from("100")
            );
            await mintTx.wait();
            await erc1363Bonding
                .connect(account1)
                .transfer(deployer.address, BigNumber.from("100"));
            const deployerBalance = await erc1363Bonding.balanceOf(
                deployer.address
            );

            expect(deployerBalance).eq(BigNumber.from("100"));
        });
    });
    describe("onTransferReceived", () => {
        it("should transfer ETH to the user according to the selling price and burn those tokens", async () => {
            const tx = await erc1363Bonding.mintTokensToAddress(
                erc1363Bonding.address,
                ethers.utils.parseEther("10")
            );
            await tx.wait();
            let totalSupply = await erc1363Bonding.totalSupply();
            const buyTx = await erc1363Bonding
                .connect(account1)
                .buyTokens(BigNumber.from("100"), {
                    value: calculatedBuyingPrice(
                        totalSupply,
                        BigNumber.from("100")
                    ),
                });
            await buyTx.wait();
            const tokenBalance = await erc1363Bonding.balanceOf(
                account1.address
            );
            expect(tokenBalance).eq(BigNumber.from("100"));
            const contractBalance = await ethers.provider.getBalance(
                erc1363Bonding.address
            );
            expect(contractBalance).eq(
                calculatedBuyingPrice(totalSupply, BigNumber.from("100"))
            );
            const startingBalance = await ethers.provider.getBalance(
                account1.address
            );
            totalSupply = await erc1363Bonding.totalSupply();
            // HERE IT FAILS: VM Exception while processing transaction: reverted with reason string 'ERC20: transfer amount exceeds balance'
            const sellTx = await erc1363Bonding.transfer(
                erc1363Bonding.address,
                BigNumber.from("10")
            );
            await sellTx.wait();
            const endingBalance = await ethers.provider.getBalance(
                account1.address
            );

            expect(startingBalance).lt(endingBalance);
        });
    });
    describe("showBannedStatus", () => {
        it("should show the banned status of a user", async () => {
            const banTx = await erc1363Bonding.banOrUnbanUser(
                account1.address,
                BigNumber.from("1")
            );
            await banTx.wait();
            expect(await erc1363Bonding.showBannedStatus(account1.address)).eq(
                BigNumber.from("1")
            );
            const unbanTx = await erc1363Bonding.banOrUnbanUser(
                account1.address,
                BigNumber.from("2")
            );
            await unbanTx.wait();

            expect(await erc1363Bonding.showBannedStatus(account1.address)).eq(
                BigNumber.from("2")
            );
        });
    });
    describe("currentPriceInWei", () => {
        it("should show the current price of one token in wei", async () => {
            let totalSupply = await erc1363Bonding.totalSupply();
            const startPrice = await erc1363Bonding.currentPriceInWei();
            const expectedStartPrice = BigNumber.from(
                BASE_PRICE.add(INCREASE_PRICE_PER_TOKEN.mul(totalSupply))
            );
            expect(startPrice).eq(expectedStartPrice);
            const startTx = await erc1363Bonding.mintTokensToAddress(
                deployer.address,
                ethers.utils.parseEther("10")
            );
            await startTx.wait();
            totalSupply = await erc1363Bonding.totalSupply();
            const endPrice = await erc1363Bonding.currentPriceInWei();
            const expectedEndPrice = BigNumber.from(
                BASE_PRICE.add(INCREASE_PRICE_PER_TOKEN.mul(totalSupply))
            );

            expect(endPrice).eq(expectedEndPrice);
            expect(endPrice).gt(startPrice);
        });
    });
    describe("calculateSellingPrice", () => {
        it("should calculate the selling price and adjust the price according to the bonding curve", async () => {
            // Mint 10 tokens to the deployer to test be able to do totalSupply - 10
            const startTx = await erc1363Bonding.mintTokensToAddress(
                deployer.address,
                ethers.utils.parseEther("10")
            );
            await startTx.wait();
            let totalSupply = await erc1363Bonding.totalSupply();
            // Calculate the selling price for 10 tokens at 10 Tokens totalSupply => 0 totalSupply after that
            const sellingPriceStart =
                await erc1363Bonding.calculateSellingPrice(
                    BigNumber.from("10")
                );
            const expectedSellingPriceStart = calculatedSellingPrice(
                totalSupply,
                BigNumber.from("10")
            );
            // Mint another 100 tokens to the deployer to test the increase of the selling price
            const endTx = await erc1363Bonding.mintTokensToAddress(
                deployer.address,
                ethers.utils.parseEther("100")
            );
            await endTx.wait();
            // Calculate the selling price for 10 tokens at 110 Tokens totalSupply
            const sellingPriceEnd = await erc1363Bonding.calculateSellingPrice(
                BigNumber.from("10")
            );
            totalSupply = await erc1363Bonding.totalSupply();
            const expectedSellingPriceEnd = calculatedSellingPrice(
                totalSupply,
                BigNumber.from("10")
            );

            expect(sellingPriceStart).eq(expectedSellingPriceStart);
            expect(sellingPriceEnd).eq(expectedSellingPriceEnd);
            expect(sellingPriceEnd).gt(sellingPriceStart);
        });
    });
    describe("calculateBuyingPrice", () => {
        it("should calculate the buying price and increase the price according to the bonding curve", async () => {
            let totalSupply = await erc1363Bonding.totalSupply();
            const buyingPriceStart = await erc1363Bonding.calculateBuyingPrice(
                BigNumber.from("10")
            );
            const expectedBuyingPriceStart = calculatedBuyingPrice(
                totalSupply,
                BigNumber.from("10")
            );
            // Mint 100 tokens to the deployer account to increase the price
            const tx = await erc1363Bonding.mintTokensToAddress(
                deployer.address,
                ethers.utils.parseEther("100")
            );
            await tx.wait();
            totalSupply = await erc1363Bonding.totalSupply();
            const buyingPriceEnd = await erc1363Bonding.calculateBuyingPrice(
                BigNumber.from("10")
            );
            const expectedBuyingPriceEnd = calculatedBuyingPrice(
                totalSupply,
                BigNumber.from("10")
            );

            expect(buyingPriceStart).eq(expectedBuyingPriceStart);
            expect(buyingPriceEnd).eq(expectedBuyingPriceEnd);
            expect(buyingPriceEnd).gt(buyingPriceStart);
        });
    });
});
