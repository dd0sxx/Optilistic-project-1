pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EvenlyDistribute is Ownable {

    using SafeMath for uint;

    mapping(address => uint) public balances;
    bool private locked;
    uint maxContribution;
    uint largestContribution;
    uint totalContribution;
    uint totalParticipants;




}