// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import OpenZeppelin contracts for ERC20 functionality and access control
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SuperCAT is ERC20, Ownable, Pausable {

    // Max supply constant (10 billion tokens with 18 decimals)
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18;  // 10 billion tokens

    // Constructor that mints the initial supply to the deployer's address
    constructor() ERC20("SuperCAT", "CAT") {
        // Mint the entire supply to the deployer's address (msg.sender)
        _mint(msg.sender, MAX_SUPPLY);
    }

    // Function to pause token transfers (emergency stop)
    function pause() external onlyOwner {
        _pause();
    }

    // Function to unpause token transfers
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override _mint function to enforce max supply restriction.
     * Ensure no more than the maximum supply can ever be minted.
     */
    function _mint(address account, uint256 amount) internal override {
        require(totalSupply() + amount <= MAX_SUPPLY, "SuperCAT: Max supply exceeded");
        super._mint(account, amount);
    }

    /**
     * @dev Allow the owner to burn tokens from their own account.
     * This function reduces the total supply.
     */
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Override transfer function to ensure token transfers are paused if needed
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal whenNotPaused override {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Allow owner to mint new tokens (if needed)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "SuperCAT: Max supply exceeded");
        _mint(to, amount);
    }
    
    /**
     * @dev Allow the owner to transfer token ownership
     * Used to transfer control of the contract to another address.
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        super.transferOwnership(newOwner);
    }

    // Optional: Additional functionality like approving allowances
    // These functions are inherited from ERC20
    // - approve(address spender, uint256 amount)
    // - transfer(address recipient, uint256 amount)
    // - transferFrom(address sender, address recipient, uint256 amount)
    // - allowance(address owner, address spender)
    // - balanceOf(address account)

}
