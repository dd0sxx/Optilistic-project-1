pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EvenlyDistribute is Ownable {

    using SafeMath for uint;

    mapping(address => uint) public balances;
    bool private locked; //when the contract is open users can enter the game, when it is locked users can withdraw funds
    uint public maxContribution; //owner set variable defining the maximum value a user can deposit
    uint private largestContribution; //largest contribution - used to ensrue that the owner does not set the maxContribution to a lower value than this in the middle of a game
    uint private totalContributions; //sum of all contributions
    uint private totalParticipants; //number of unique addresses that have contributed
    uint public startTime; //time the game was started, used so that if the owner does not lock the contract in 30 days a user can lock the contract themselves
    uint private lockTime; //time the contract was locked, used to give a window to contributors to withdraw their money before the next game starts
    address[] contributors; //list of unique addresses that have contributed

    constructor() {
        // unsure if some of this instantiation is neccessary (if units are 0 / bools are false by default)
        locked = false;
        // pretty sure uints are 0 by default
        // maxContribution = 0;
        // largestContribution = 0;
        // totalContributions = 0;
        // totalParticipants = 0;
        startTime = block.timestamp;
    }

    // function to allow the owner to adjust the maximum contribution
    function updateMax (uint _newMax) public onlyOwner {
        require(_newMax >= largestContribution, 'updateMax: _newMax is smaller than largestContribution');
        require(_newMax >= 0.1 ether, 'updateMax: _newMax is smaller than 0.1 ether');
        maxContribution = _newMax;
    }

    // function to allow the owner to lock the contract
    function lockContract () public onlyOwner {
        require (!locked, 'lockContract: contract is already locked');
        locked = true;
        lockTime = block.timestamp;
    }

    // this exists incase the owner does not lock the contract within one month of the start date. Users can unlock the contract themselves after one month has passed.
    function lockContractOnTime () public {
        require (block.timestamp >= startTime + 30 days && !locked, 'lockContractOnTime: 1 month has not passed or the contract is already locked');
        locked = true;
        lockTime = block.timestamp;
    }

    // allows users to withdraw their portion of the funds
    function withdraw () public {
        // check that game is locked, and the user has a valid balance
        require (locked, 'withdraw: game has not been locked yet');
        require (balances[msg.sender] >= 0.1 ether, 'withdraw: you are not eligible to withdraw funds');

        uint _amount = totalContributions.div(totalParticipants);
        balances[msg.sender] = 0;

        (bool success, bytes memory data) = msg.sender.call{value: _amount}("");
        // we could emit an event here with the success and data variables, or change the function to return these values
    }

    // reset the game one week after the locktime
    function resetGame () public onlyOwner {
        require (block.timestamp >= lockTime + 7 days);
        // I could try and loop through the balances array and send ether to anyone who hasn't already withdrawn it, but I'll ignore that detail for now. I could also keep it myself as the owner and provide a function for me to withdraw any leftover funds, or just have it rollover into the next game's earnings.
        
        //this loop resets the mapping to default
        for (uint i; i < contributors.length; i += 1) {
            balances[contributors[i]] = 0;     
        }

        largestContribution = 0; 
        totalContributions = 0;
        totalParticipants = 0;
        delete contributors; //I've read that delete is a gas efficient way to reassign an empty array
        locked = false;
        startTime= block.timestamp; 
    }

    //fallback is equivalent to the contribute function, allows users to enter the game
    fallback() external payable {
        //game cannot be locked, contribution cannot be smaller than 1 ether, and contribution cannot exceed maximum set by owner
        require (!locked && msg.value >= 0.1 ether, 'Contribute: game is locked or msg.value < 0.1 ether');
        require (balances[msg.sender] + msg.value <= maxContribution, 'Contribute: cannot contribute more than max');

        uint _amount = msg.value;
        // if balance = 0, address is a new participant
        if (balances[msg.sender] == 0) {
            totalParticipants = totalParticipants.add(1);
            contributors.push(msg.sender);
        }
        //if contribution is the largest contribution update the variable
        if (_amount > largestContribution) {
            largestContribution = _amount;
        }
        //update balance mapping and total contributions var
        balances[msg.sender] = balances[msg.sender].add(_amount);
        totalContributions = totalContributions.add(_amount);
    }

}