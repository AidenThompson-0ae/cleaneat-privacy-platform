// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint16, externalEuint16} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title CleanEat
 * @notice Privacy-preserving canteen rating system using FHEVM
 * @dev Users submit encrypted ratings (nutrition & satisfaction scores)
 *      Aggregates are computed on encrypted data without revealing individual scores
 *      Supports 5 food stalls with encrypted rating aggregation
 */
contract CleanEat is ZamaEthereumConfig {
    // Stall count (5 stalls: A, B, C, D, E)
    uint8 public constant STALL_COUNT = 5;
    
    // Thresholds for white/black list
    uint16 public nutritionThreshold = 70;
    uint16 public satisfactionThreshold = 75;
    
    // Contract owner
    address public owner;
    
    // Authorized logistics staff
    mapping(address => bool) public authorizedLogistics;
    
    // Rating structure
    struct Rating {
        address user;
        uint8 stallId;
        euint16 nutrition;
        euint16 satisfaction;
        string comment;
        uint256 timestamp;
    }
    
    // All ratings
    Rating[] public ratings;
    
    // User ratings mapping
    mapping(address => uint256[]) public userRatings;
    
    // Stall aggregates (encrypted sums)
    mapping(uint8 => euint16) public stallNutritionSum;
    mapping(uint8 => euint16) public stallSatisfactionSum;
    mapping(uint8 => uint256) public stallRatingCount;
    
    // Events
    event RatingSubmitted(
        uint256 indexed ratingId,
        address indexed user,
        uint8 indexed stallId,
        uint256 timestamp
    );
    
    event ThresholdUpdated(uint16 nutritionThreshold, uint16 satisfactionThreshold);
    event LogisticsAuthorized(address indexed logistics, bool authorized);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedLogistics[msg.sender], "Not authorized");
        _;
    }
    
    modifier validStall(uint8 stallId) {
        require(stallId < STALL_COUNT, "Invalid stall ID");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedLogistics[msg.sender] = true; // Owner is authorized by default
        // Note: Encrypted variables (euint16) are zero-initialized by default
        // No need to explicitly initialize stallNutritionSum and stallSatisfactionSum
    }
    
    /**
     * @notice Submit an encrypted rating for a stall
     * @param stallId Stall ID (0-4)
     * @param inputNutrition Encrypted nutrition score (1-100)
     * @param inputProofNutrition Input proof for nutrition
     * @param inputSatisfaction Encrypted satisfaction score (1-100)
     * @param inputProofSatisfaction Input proof for satisfaction
     * @param comment Optional public comment
     */
    function submitRating(
        uint8 stallId,
        externalEuint16 inputNutrition,
        bytes calldata inputProofNutrition,
        externalEuint16 inputSatisfaction,
        bytes calldata inputProofSatisfaction,
        string calldata comment
    ) external validStall(stallId) {
        // Convert external inputs and store directly in Rating struct
        uint256 ratingId = ratings.length;
        
        ratings.push(Rating({
            user: msg.sender,
            stallId: stallId,
            nutrition: FHE.fromExternal(inputNutrition, inputProofNutrition),
            satisfaction: FHE.fromExternal(inputSatisfaction, inputProofSatisfaction),
            comment: comment,
            timestamp: block.timestamp
        }));
        
        userRatings[msg.sender].push(ratingId);
        
        // Access from storage and grant permissions before using in FHE operations
        Rating storage rating = ratings[ratingId];
        FHE.allowThis(rating.nutrition);
        FHE.allowThis(rating.satisfaction);
        
        // Update stall aggregates - now safe to use in FHE operations
        stallNutritionSum[stallId] = FHE.add(stallNutritionSum[stallId], rating.nutrition);
        stallSatisfactionSum[stallId] = FHE.add(stallSatisfactionSum[stallId], rating.satisfaction);
        stallRatingCount[stallId]++;
        
        // Grant contract permission to use the updated sums in future operations
        FHE.allowThis(stallNutritionSum[stallId]);
        FHE.allowThis(stallSatisfactionSum[stallId]);
        
        // Allow user to decrypt their own rating later
        FHE.allow(rating.nutrition, msg.sender);
        FHE.allow(rating.satisfaction, msg.sender);
        
        emit RatingSubmitted(ratingId, msg.sender, stallId, block.timestamp);
    }
    
    /**
     * @notice Get encrypted aggregated sums for a stall
     * @param stallId Stall ID
     * @return nutritionSum Encrypted sum of nutrition scores
     * @return satisfactionSum Encrypted sum of satisfaction scores
     * @return totalRatings Total number of ratings (plaintext for calculating average)
     * @dev Frontend should decrypt the sums and divide by totalRatings to get averages
     */
    function getStallAggregates(uint8 stallId)
        external
        view
        validStall(stallId)
        returns (euint16 nutritionSum, euint16 satisfactionSum, uint256 totalRatings)
    {
        totalRatings = stallRatingCount[stallId];
        nutritionSum = stallNutritionSum[stallId];
        satisfactionSum = stallSatisfactionSum[stallId];
    }
    
    /**
     * @notice Grant permission to decrypt all stall aggregates
     * @dev Call this once before decrypting leaderboard data
     *      Only grants permission for stalls that have ratings
     */
    function allowAllStallAggregates() external {
        for (uint8 i = 0; i < 5; i++) {
            // Only allow decryption if stall has ratings
            // (avoids issues with zero-valued encrypted variables in Mock mode)
            if (stallRatingCount[i] > 0) {
                FHE.allow(stallNutritionSum[i], msg.sender);
                FHE.allow(stallSatisfactionSum[i], msg.sender);
            }
        }
    }
    
    /**
     * @notice Get all rating IDs for a user
     * @param user User address
     * @return Array of rating IDs
     */
    function getUserRatings(address user) external view returns (uint256[] memory) {
        return userRatings[user];
    }
    
    /**
     * @notice Get rating details (handles for decryption)
     * @param ratingId Rating ID
     * @return user User address
     * @return stallId Stall ID
     * @return nutrition Encrypted nutrition handle (euint16)
     * @return satisfaction Encrypted satisfaction handle (euint16)
     * @return comment Public comment
     * @return timestamp Timestamp
     */
    function getRating(uint256 ratingId)
        external
        view
        returns (
            address user,
            uint8 stallId,
            euint16 nutrition,
            euint16 satisfaction,
            string memory comment,
            uint256 timestamp
        )
    {
        require(ratingId < ratings.length, "Invalid rating ID");
        Rating storage rating = ratings[ratingId];
        
        return (
            rating.user,
            rating.stallId,
            rating.nutrition,
            rating.satisfaction,
            rating.comment,
            rating.timestamp
        );
    }
    
    /**
     * @notice Allow user to decrypt their own rating
     * @param ratingId Rating ID
     * @dev This is already done in submitRating, but provided for explicit re-authorization if needed
     */
    function allowUserDecrypt(uint256 ratingId) external {
        require(ratingId < ratings.length, "Invalid rating ID");
        Rating storage rating = ratings[ratingId];
        require(rating.user == msg.sender, "Not your rating");
        
        // Re-authorize decryption (already done in submitRating, but allows explicit calls)
        FHE.allow(rating.nutrition, msg.sender);
        FHE.allow(rating.satisfaction, msg.sender);
    }
    
    /**
     * @notice Check if address is authorized logistics staff
     * @param user Address to check
     * @return True if authorized
     */
    function isAuthorized(address user) external view returns (bool) {
        return authorizedLogistics[user];
    }
    
    /**
     * @notice Authorize logistics staff (owner only)
     * @param logistics Address to authorize
     * @param authorized True to authorize, false to revoke
     */
    function setLogisticsAuthorization(address logistics, bool authorized) external onlyOwner {
        authorizedLogistics[logistics] = authorized;
        emit LogisticsAuthorized(logistics, authorized);
    }
    
    /**
     * @notice Allow authorized logistics to view stall aggregates
     * @param stallId Stall ID
     */
    function allowLogisticsView(uint8 stallId) external onlyAuthorized validStall(stallId) {
        FHE.allow(stallNutritionSum[stallId], msg.sender);
        FHE.allow(stallSatisfactionSum[stallId], msg.sender);
    }
    
    /**
     * @notice Update thresholds (owner only)
     * @param _nutritionThreshold New nutrition threshold
     * @param _satisfactionThreshold New satisfaction threshold
     */
    function updateThresholds(
        uint16 _nutritionThreshold,
        uint16 _satisfactionThreshold
    ) external onlyOwner {
        nutritionThreshold = _nutritionThreshold;
        satisfactionThreshold = _satisfactionThreshold;
        emit ThresholdUpdated(_nutritionThreshold, _satisfactionThreshold);
    }
    
    /**
     * @notice Get current thresholds
     */
    function getThresholds() external view returns (uint16, uint16) {
        return (nutritionThreshold, satisfactionThreshold);
    }
    
    /**
     * @notice Get total number of ratings
     */
    function getTotalRatings() external view returns (uint256) {
        return ratings.length;
    }
    
    /**
     * @notice Get stall names (helper for frontend)
     * @param stallId Stall ID
     */
    function getStallName(uint8 stallId) external pure validStall(stallId) returns (string memory) {
        if (stallId == 0) return "Stall A - Sichuan Cuisine";
        if (stallId == 1) return "Stall B - Cantonese Cuisine";
        if (stallId == 2) return "Stall C - Western Fast Food";
        if (stallId == 3) return "Stall D - Noodle Bar";
        if (stallId == 4) return "Stall E - Vegetarian Options";
        return "";
    }
}

