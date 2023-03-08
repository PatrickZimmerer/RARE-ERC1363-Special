Mutation testing report:
Number of mutations:    37
Killed:                 27 / 37

Mutations:
Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 89
    Result: Killed
    Original line:
                     msg.value == buyingPrice,

    Mutated line:
                     msg.value != buyingPrice,


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 30
    Result: Killed
    Original line:
                 require(bannedUsers[msg.sender] != 1, "You are banned");

    Mutated line:
                 require(bannedUsers[msg.sender] == 1, "You are banned");


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 89
    Result: Killed
    Original line:
                     msg.value == buyingPrice,

    Mutated line:
                     msg.value != buyingPrice,


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 193
    Result: Killed
    Original line:
                     bannedUsers[from] != 1,

    Mutated line:
                     bannedUsers[from] == 1,


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 197
    Result: Killed
    Original line:
                     bannedUsers[to] != 1,

    Mutated line:
                     bannedUsers[to] == 1,


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 140
    Result: Killed
    Original line:
                 return BASE_PRICE + (INCREASE_PRICE_PER_TOKEN * totalSupply());

    Mutated line:
                 return BASE_PRICE - (INCREASE_PRICE_PER_TOKEN * totalSupply());


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 140
    Result: Killed
    Original line:
                 return BASE_PRICE + (INCREASE_PRICE_PER_TOKEN * totalSupply());

    Mutated line:
                 return BASE_PRICE + (INCREASE_PRICE_PER_TOKEN / totalSupply());


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 150
    Result: Error
    Original line:
                     INCREASE_PRICE_PER_TOKEN +

    Mutated line:
                     INCREASE_PRICE_PER_TOKEN - BASE_PRICE;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 149
    Result: Killed
    Original line:
                 uint256 startingPrice = totalSupply() *

    Mutated line:
                 uint256 startingPrice = totalSupply() / INCREASE_PRICE_PER_TOKEN +


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 153
    Result: Error
    Original line:
                     INCREASE_PRICE_PER_TOKEN +

    Mutated line:
                     INCREASE_PRICE_PER_TOKEN - BASE_PRICE;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 152
    Result: Killed
    Original line:
                 uint256 endingPrice = (totalSupply() + _amount) *

    Mutated line:
                 uint256 endingPrice = (totalSupply() + _amount) / INCREASE_PRICE_PER_TOKEN +


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 152
    Result: Error
    Original line:
                 uint256 endingPrice = (totalSupply() + _amount) *

    Mutated line:
                 uint256 endingPrice = (totalSupply() - _amount) *


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 155
    Result: Killed
    Original line:
                 uint256 buyingPrice = ((startingPrice + endingPrice) * _amount) / 2;

    Mutated line:
                 uint256 buyingPrice = ((startingPrice + endingPrice) * _amount) * 2;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 155
    Result: Killed
    Original line:
                 uint256 buyingPrice = ((startingPrice + endingPrice) * _amount) / 2;

    Mutated line:
                 uint256 buyingPrice = ((startingPrice + endingPrice) / _amount) / 2;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 155
    Result: Error
    Original line:
                 uint256 buyingPrice = ((startingPrice + endingPrice) * _amount) / 2;

    Mutated line:
                 uint256 buyingPrice = ((startingPrice - endingPrice) * _amount) / 2;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 169
    Result: Error
    Original line:
                     INCREASE_PRICE_PER_TOKEN +

    Mutated line:
                     INCREASE_PRICE_PER_TOKEN - BASE_PRICE;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 168
    Result: Killed
    Original line:
                 uint256 startingPrice = totalSupply() *

    Mutated line:
                 uint256 startingPrice = totalSupply() / INCREASE_PRICE_PER_TOKEN +


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 172
    Result: Error
    Original line:
                     INCREASE_PRICE_PER_TOKEN +

    Mutated line:
                     INCREASE_PRICE_PER_TOKEN - BASE_PRICE;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 171
    Result: Killed
    Original line:
                 uint256 endingPrice = (totalSupply() - _amount) *

    Mutated line:
                 uint256 endingPrice = (totalSupply() - _amount) / INCREASE_PRICE_PER_TOKEN +


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 171
    Result: Killed
    Original line:
                 uint256 endingPrice = (totalSupply() - _amount) *

    Mutated line:
                 uint256 endingPrice = (totalSupply() + _amount) *


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 174
    Result: Killed
    Original line:
                 uint256 sellingPrice = (((startingPrice + endingPrice) * _amount) / 2);

    Mutated line:
                 uint256 sellingPrice = (((startingPrice + endingPrice) * _amount) * 2);


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 174
    Result: Killed
    Original line:
                 uint256 sellingPrice = (((startingPrice + endingPrice) * _amount) / 2);

    Mutated line:
                 uint256 sellingPrice = (((startingPrice + endingPrice) / _amount) / 2);


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 174
    Result: Killed
    Original line:
                 uint256 sellingPrice = (((startingPrice + endingPrice) * _amount) / 2);

    Mutated line:
                 uint256 sellingPrice = (((startingPrice - endingPrice) * _amount) / 2);


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 176
    Result: Killed
    Original line:
                     sellingPrice -

    Mutated line:
                     sellingPrice + (sellingPrice * SELLING_FEE_IN_PERCENT) /


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 177
    Result: Error
    Original line:
                     (sellingPrice * SELLING_FEE_IN_PERCENT) /

    Mutated line:
                     (sellingPrice * SELLING_FEE_IN_PERCENT) * 100;


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 177
    Result: Killed
    Original line:
                     (sellingPrice * SELLING_FEE_IN_PERCENT) /

    Mutated line:
                     (sellingPrice / SELLING_FEE_IN_PERCENT) /


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 66
    Result: Killed
    Original line:
                 _transfer(_from, _to, _amount);

    Mutated line:
                 


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 79
    Result: Killed
    Original line:
                 _mint(recipient, amount); // mint amount of wTokens and send to recipient

    Mutated line:
                  // mint amount of wTokens and send to recipient


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 92
    Result: Killed
    Original line:
                 _mint(msg.sender, _amount);

    Mutated line:
                 


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 115
    Result: Lived
    Original line:
                 _burn(address(this), amount);

    Mutated line:
                 


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 38
    Result: Equivalent
    Original line:
             ) ERC20(_name, _symbol) ERC20Capped(MAX_SUPPLY) {

    Mutated line:
             )  ERC20Capped(MAX_SUPPLY) {


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 38
    Result: Equivalent
    Original line:
             ) ERC20(_name, _symbol) ERC20Capped(MAX_SUPPLY) {

    Mutated line:
             ) ERC20(_name, _symbol)  {


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 51
    Result: Killed
    Original line:
             ) external onlyOwner {

    Mutated line:
             ) external  {


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 65
    Result: Killed
    Original line:
             ) external onlyOwner {

    Mutated line:
             ) external  {


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 78
    Result: Killed
    Original line:
             ) external onlyOwner {

    Mutated line:
             ) external  {


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 85
    Result: Killed
    Original line:
             function buyTokens(uint256 _amount) external payable onlyUnbanned {

    Mutated line:
             function buyTokens(uint256 _amount) external payable  {


Mutation:
    File: /Users/patrickzimmerer/Desktop/Rare/Code/ERC1363Contracts/contracts/ERC1363Bonding.sol
    Line nr: 126
    Result: Killed
    Original line:
             function adminWithdraw() external onlyOwner {

    Mutated line:
             function adminWithdraw() external  {


