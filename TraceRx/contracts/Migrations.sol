// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// migration bookkeeping
contract Migrations {
  // deployer address
  address public owner = msg.sender;

  // latest step recorded
  uint public last_completed_migration;

  // admin gate
  modifier restricted() {
    require(msg.sender == owner, "Owner only.");
    _;
  }

  // record progress; used by the migration runner to mark completion
  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }
}
