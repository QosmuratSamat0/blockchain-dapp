// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedValue;

    event ValueChanged(uint256 newValue);

    function set(uint256 _value) public {
        storedValue = _value;
        emit ValueChanged(_value);
    }

    function get() public view returns (uint256) {
        return storedValue;
    }

    function getValue() public view returns (uint256) {
        return storedValue;
    }

    function retrieve() public view returns (uint256) {
        return storedValue;
    }
}
