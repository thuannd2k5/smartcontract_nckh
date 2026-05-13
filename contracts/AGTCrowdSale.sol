// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; /*revert when transaction failed */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract AGTCrowdSale is Ownable {
    using SafeERC20 for IERC20;
    address payable public _wallet;
    uint256 public BNB_rate;
    IERC20 public token;

    event BuyTokenByBNB(address buyer, uint256 amount);
    event SetBNBRate(uint256 newRate);

    constructor(uint256 bnb_rate, address payable wallet, IERC20 icotoken) {
        BNB_rate = bnb_rate;
        _wallet = wallet;
        token = icotoken;
    }

    function setBNBRate(uint256 new_rate) public onlyOwner {
        BNB_rate = new_rate;
        emit SetBNBRate(new_rate);
    }

    function buyTokenByBNB() external payable {
        uint256 bnbAmount = msg.value;
        uint256 amount = getTokenAmountBNB(bnbAmount);
        require(amount > 0, "Amount is zero");
        require(
            token.balanceOf(address(this)) >= amount,
            "Insufficient account balance in address(this)"
        );
        require(
            msg.sender.balance >= bnbAmount,
            "Insufficient account balance in msg.sender"
        );
        payable(_wallet).transfer(bnbAmount);
        SafeERC20.safeTransfer(token, msg.sender, amount);
        emit BuyTokenByBNB(msg.sender, amount);
    }

    function getTokenAmountBNB(
        uint256 BNBAmount
    ) public view returns (uint256) {
        return BNBAmount * BNB_rate;
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
