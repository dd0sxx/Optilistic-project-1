pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EvenlyDistribute is Ownable {

    using SafeMath for uint;

    mapping(address => uint) public balances;
    bool private locked;
    uint public maxContribution;
    uint private largestContribution;
    uint private totalContributions;
    uint private totalParticipants;
    uint public startTime;

    constructor() {
        // unsure if this is neccessary or if units are 0 / bools are false by default
        locked = false;
        maxContribution = 0;
        largestContribution = 0;
        totalContributions = 0;
        totalParticipants = 0;
        startTime = block.timestamp;
    }

    function updateMax (uint _newMax) public onlyOwner {
        require(_newMax >= largestContribution, 'updateMax: _newMax is smaller than largestContribution');
        require(_newMax >= 0.1 ether, 'updateMax: _newMax is smaller than 0.1 ether');
        maxContribution = _newMax;
    }

    function lockContract () public onlyOwner {
        locked = true;
    }

    function withdraw () public {
        // check that game is locked or it has been over a month, and the user has a valid balance
            require (locked, 'withdraw: game has not been locked yet');

        require (balances[msg.sender] >= 0.1 ether, 'withdraw: you are not eligible to withdraw funds');

    }

    function lockContractOnTime () public {
        require (block.timestamp >= startTime + 30 days);
        locked = true;
    }

    fallback() external payable {
        //game cannot be locked, contribution cannot be smaller than 1 ether, and contribution cannot exceed maximum set by owner
        require (!locked && msg.value >= 0.1 ether, 'Contribute: game is locked or msg.value < 0.1 ether');
        require (balances[msg.sender] + msg.value <= maxContribution, 'Contribute: cannot contribute more than max');

        uint _amount = msg.value;
        // if balance = 0, address is a new participant
        if (balances[msg.sender] == 0) {
            totalParticipants = totalParticipants.add(1);
        }
        //if contribution is the largets contribution update the variable
        if (_amount > largestContribution) {
            largestContribution = _amount;
        }
        //update balance mapping and total contributions var
        balances[msg.sender] = balances[msg.sender].add(_amount);
        totalContributions = totalContributions.add(_amount);
    }

}