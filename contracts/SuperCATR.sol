// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IEntropyConsumer } from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import { IEntropy } from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";

contract SuperCatR is ERC20, IEntropyConsumer {
  IEntropy public entropy;
  address public provider;

  event ModifierRequested(uint64 sequenceNumber);
  event ModifierResult(uint64 sequenceNumber, bool isDouble);

    constructor() ERC20("SuperCATR", "CAT") {
        entropy = IEntropy(0x4821932D0CDd71225A6d914706A621e0389D7061);
        provider = 0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344;
        // Initial supply of 1 million tokens with 18 decimals
        _mint(msg.sender, 1000000 * 10**decimals());
    }

  // This method is required by the IEntropyConsumer interface
  function getEntropy() internal view override returns (address) {
    return address(entropy);
  }

  function request(bytes32 userRandomNumber) external payable {
    // get the required fee
    uint128 requestFee = entropy.getFee(provider);
    // check if the user has sent enough fees
    if (msg.value < requestFee) revert("not enough fees");
 
    // pay the fees and request a random number from entropy
    uint64 sequenceNumber = entropy.requestWithCallback{ value: requestFee }(
      provider,
      userRandomNumber
    );
 
    // emit event
    emit ModifierRequested(sequenceNumber);
  }

  function entropyCallback(
    uint64 sequenceNumber,
    // If your app uses multiple providers, you can use this argument
    // to distinguish which one is calling the app back. This app only
    // uses one provider so this argument is not used.
    address _providerAddress,
    bytes32 randomNumber
  ) internal override {
    bool isDouble = uint256(randomNumber) % 2 == 0;
 
    emit ModifierResult(sequenceNumber, isDouble);
  }
}
