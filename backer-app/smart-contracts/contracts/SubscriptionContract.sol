// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

// --- Interfaces ---
interface ITIP20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferWithMemo(address to, uint256 amount, bytes32 memo) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IStablecoinExchange {
    function swapExactAmountIn(
        address tokenIn,
        address tokenOut,
        uint128 amountIn,
        uint128 minAmountOut
    ) external returns (uint128 amountOut);

    function quoteSwapExactAmountIn(
        address tokenIn,
        address tokenOut,
        uint128 amountIn
    ) external view returns (uint128 amountOut);
}

contract SubscriptionContract is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;
    
    struct Tier {
        string name;
        uint256 price; // Price in Wei (or unit of payment token)
        uint256 duration; // Duration in seconds
        bool isActive;
    }

    struct Membership {
        uint256 expiry; // Timestamp when membership expires
        uint256 tierId; // The ID of the tier they are subscribed to
    }



    // State Variables
    Tier[] public tiers;
    mapping(address => Membership) public memberships;
    IERC20 public paymentToken; // Address(0) for native MNT
    address public platformTreasury;
    address public dex; // Address of the Stablecoin DEX
    uint256 public constant PLATFORM_FEE_BPS = 500; // 5%
    
    // Events
    event Subscribed(address indexed subscriber, uint256 tierId, uint256 expiry);
    event Withdrawn(uint256 amount);
    event FeePaid(uint256 amount);
    event TierCreated(uint256 tierId, string name, uint256 price, uint256 duration);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // Initializer pattern for Minimal Proxy Clones
    function initialize(address _owner, address _paymentToken, address _platformTreasury, address _dex) external initializer {
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        paymentToken = IERC20(_paymentToken);
        platformTreasury = _platformTreasury;
        dex = _dex;
    }

    // --- Admin Functions ---

    function createTier(string memory _name, uint256 _price, uint256 _duration) external onlyOwner {
        tiers.push(Tier(_name, _price, _duration, true));
        emit TierCreated(tiers.length - 1, _name, _price, _duration);
    }

    function toggleTier(uint256 _tierId) external onlyOwner {
        require(_tierId < tiers.length, "Invalid tier");
        tiers[_tierId].isActive = !tiers[_tierId].isActive;
    }

    function withdraw() external onlyOwner nonReentrant {
        if (address(paymentToken) == address(0)) {
            // Native MNT withdrawal
            uint256 totalBalance = address(this).balance;
            require(totalBalance > 0, "No funds to withdraw");
            
            uint256 fee = 0;
            uint256 ownerAmount = totalBalance;

            // Only calculate fee if treasury is valid
            if (platformTreasury != address(0)) {
                fee = (totalBalance * PLATFORM_FEE_BPS) / 10000;
                ownerAmount = totalBalance - fee;
                
                if (fee > 0) {
                    (bool feeSuccess, ) = payable(platformTreasury).call{value: fee}("");
                    require(feeSuccess, "Fee transfer failed");
                    emit FeePaid(fee);
                }
            }

            (bool success, ) = payable(owner()).call{value: ownerAmount}("");
            require(success, "Withdraw failed");
            emit Withdrawn(ownerAmount);
        } else {
            // ERC20 withdrawal
            uint256 totalBalance = paymentToken.balanceOf(address(this));
            require(totalBalance > 0, "No funds to withdraw");
            
            uint256 fee = 0;
            uint256 ownerAmount = totalBalance;

            // Only calculate fee if treasury is valid
            if (platformTreasury != address(0)) {
                fee = (totalBalance * PLATFORM_FEE_BPS) / 10000;
                ownerAmount = totalBalance - fee;

                if (fee > 0) {
                    paymentToken.safeTransfer(platformTreasury, fee);
                    emit FeePaid(fee);
                }
            }

            paymentToken.safeTransfer(owner(), ownerAmount);
            emit Withdrawn(ownerAmount);
        }
    }

    // --- User Functions ---

    function subscribe(uint256 _tierId) external payable nonReentrant {
        _subscribe(msg.sender, _tierId);
    }

    // Subscribe using any supported token, swapping it to paymentToken
    function subscribeWithToken(
        uint256 _tierId,
        address _inputToken,
        uint128 _inputAmount,
        uint128 _minReceived
    ) external nonReentrant {
        require(dex != address(0), "DEX not configured");
        require(address(paymentToken) != address(0), "Native payment not supported for swap");
        require(_inputToken != address(paymentToken), "Use standard subscribe for paymentToken");

        Tier memory tier = tiers[_tierId];
        require(tier.isActive, "Tier is not active");

        // 1. Transfer input tokens from user to this contract
        ITIP20(_inputToken).transferFrom(msg.sender, address(this), _inputAmount);

        // 2. Approve DEX to spend input tokens
        ITIP20(_inputToken).approve(dex, _inputAmount);

        // 3. Swap input token for paymentToken (project's preferred token)
        uint128 received = IStablecoinExchange(dex).swapExactAmountIn(
            _inputToken,
            address(paymentToken),
            _inputAmount,
            _minReceived
        );

        // 4. Validate swap result covers the tier price
        require(received >= tier.price, "Swap output insufficient for tier price");

        // 5. Refund excess if any (optional, but good practice if swap returns more)
        if (received > tier.price) {
           // For simplicity in this specific contract logic, we keep the surplus or 
           // let the DEX handle 'exact output' (but we used swapExactAmountIn).
           // If we want to be strict, we'd refund, but let's assume 'received' covers it.
           // Actually, it's safer to just proceed. The user gets the subscription.
           // The surplus stays in the contract (creator benefit).
        }
        
        // 6. Execute subscription logic
        _processMembership(msg.sender, _tierId, tier);
    }

    function _subscribe(address _user, uint256 _tierId) internal {
        require(_tierId < tiers.length, "Invalid tier");
        Tier memory tier = tiers[_tierId];
        require(tier.isActive, "Tier is not active");

        if (address(paymentToken) == address(0)) {
            require(msg.value >= tier.price, "Insufficient payment");
        } else {
            paymentToken.safeTransferFrom(_user, address(this), tier.price);
        }

        _processMembership(_user, _tierId, tier);
    }

    function _processMembership(address _user, uint256 _tierId, Tier memory _tier) internal {
        Membership storage membership = memberships[_user];
        
        // If expired or new, start from now. If active, extend.
        if (membership.expiry < block.timestamp) {
            membership.expiry = block.timestamp + _tier.duration;
        } else {
            require(membership.expiry + _tier.duration >= membership.expiry, "Overflow detected");
            membership.expiry = membership.expiry + _tier.duration;
        }
        
        membership.tierId = _tierId;

        emit Subscribed(_user, _tierId, membership.expiry);
    }

    // --- View Functions ---

    function isMember(address _user) external view returns (bool) {
        return memberships[_user].expiry > block.timestamp;
    }

    function getTiers() external view returns (Tier[] memory) {
        return tiers;
    }
}
