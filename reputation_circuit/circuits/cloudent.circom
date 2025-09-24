pragma circom 2.1.6;

include "poseidon.circom";
include "comparators.circom";

template Mux1() {
    signal input c[2];
    signal input s;
    signal output out;
    
    out <== c[0] + s * (c[1] - c[0]);
}

template FixedPointAverage() {
    signal input sum;
    signal input count;
    signal input avgScaled;
    signal output validAverage;
    
    component countPositive = GreaterThan(8);
    countPositive.in[0] <== count;
    countPositive.in[1] <== 0;
    countPositive.out === 1;
    
    signal scaledSum <== sum * 100;
    
    signal remainder;
    remainder <== scaledSum - avgScaled * count;
    component remainderCheck = LessThan(16);
    remainderCheck.in[0] <== remainder;
    remainderCheck.in[1] <== count;
    
    component remainderPositive = GreaterEqThan(16);
    remainderPositive.in[0] <== remainder;
    remainderPositive.in[1] <== 0;
    
    validAverage <== remainderCheck.out * remainderPositive.out;
    validAverage === 1; 
}

template SingleRatingValidator() {
    signal input rating;
    signal input isActive; 
    signal output isValid;
    signal output contributionToSum;
    
    component minCheck = GreaterEqThan(4);
    minCheck.in[0] <== rating;
    minCheck.in[1] <== 1;
    
    component maxCheck = LessEqThan(4);
    maxCheck.in[0] <== rating;
    maxCheck.in[1] <== 5;
    
    signal validBounds <== minCheck.out * maxCheck.out;
    
    isValid <== 1 - isActive + isActive * validBounds;
    
    signal activeAndValid <== isActive * validBounds;
    contributionToSum <== rating * activeAndValid;
    
    isActive * (1 - validBounds) === 0;
}

template RatingValidator(maxRatings) {
    signal input ratings[maxRatings];
    signal input numRatings;
    signal output isValid;
    signal output sum;

    component numRatingsCheck = LessEqThan(8);
    numRatingsCheck.in[0] <== numRatings;
    numRatingsCheck.in[1] <== maxRatings;
    
    component numRatingsPositive = GreaterThan(8);
    numRatingsPositive.in[0] <== numRatings;
    numRatingsPositive.in[1] <== 0;
    
    component ratingValidators[maxRatings];
    component withinCountChecks[maxRatings];
    signal ratingSum[maxRatings + 1];
    
    for (var i = 0; i < maxRatings; i++) {
        ratingValidators[i] = SingleRatingValidator();
        withinCountChecks[i] = LessThan(8);
    }
    
    ratingSum[0] <== 0;
    
    for (var i = 0; i < maxRatings; i++) {
        ratingValidators[i].rating <== ratings[i];
        
        withinCountChecks[i].in[0] <== i;
        withinCountChecks[i].in[1] <== numRatings;
        ratingValidators[i].isActive <== withinCountChecks[i].out;
        
        ratingSum[i + 1] <== ratingSum[i] + ratingValidators[i].contributionToSum;
        
        ratingValidators[i].isValid === 1;
    }
    
    sum <== ratingSum[maxRatings];
    isValid <== numRatingsCheck.out * numRatingsPositive.out;
}

template ReviewCommitment(numReviews) {
    signal input reviewHashes[numReviews];
    signal output reviewRoot;

    component hasher = Poseidon(numReviews);
    for (var i = 0; i < numReviews; i++) {
        hasher.inputs[i] <== reviewHashes[i];
    }
    
    reviewRoot <== hasher.out;
}


template AIAgentReputation(maxRatings, maxReviews) {
    signal input ratings[maxRatings];
    signal input reviewHashes[maxReviews];
    signal input privateUptimeBps;
    signal input privateAvgExecTimeMs;
    signal input privateReqsPerDay;
    signal input privateDeploymentCount;
    signal input agentId;
    signal input epochDay;
    signal input numRatings;
    signal input claimedUptimeBps;
    signal input claimedAvgExecTimeMs;
    signal input claimedReqsPerDay;
    signal input claimedDeploymentCount;
    signal input avgScaled; 
    
    signal output avgRatingScaled;
    signal output verifiedNumRatings;
    signal output reviewRoot;
    signal output uptimeBps;
    signal output avgExecTimeMs;
    signal output reqsPerDay;
    signal output deploymentCount;
    signal output verifiedAgentId;
    signal output verifiedEpochDay;

    component ratingValidator = RatingValidator(maxRatings);
    component avgComputer = FixedPointAverage();
    component reviewCommitment = ReviewCommitment(maxReviews);
    component uptimeCheck = LessEqThan(16);
    component uptimePositive = GreaterEqThan(16);
    component execTimeCheck = LessEqThan(16);
    component execTimePositive = GreaterEqThan(16);
    component reqsCheck = LessEqThan(32);
    component reqsPositive = GreaterEqThan(16);
    component deployCheck = LessEqThan(16);
    component deployPositive = GreaterEqThan(16);
    
    for (var i = 0; i < maxRatings; i++) {
        ratingValidator.ratings[i] <== ratings[i];
    }
    ratingValidator.numRatings <== numRatings;
    
    ratingValidator.isValid === 1;
    
    avgComputer.sum <== ratingValidator.sum;
    avgComputer.count <== numRatings;
    avgComputer.avgScaled <== avgScaled;
    
    privateUptimeBps === claimedUptimeBps;
    privateAvgExecTimeMs === claimedAvgExecTimeMs;
    privateReqsPerDay === claimedReqsPerDay;
    privateDeploymentCount === claimedDeploymentCount;
    
    uptimeCheck.in[0] <== privateUptimeBps;
    uptimeCheck.in[1] <== 10000;
    uptimeCheck.out === 1;
    
    uptimePositive.in[0] <== privateUptimeBps;
    uptimePositive.in[1] <== 0;
    uptimePositive.out === 1;
    
    execTimeCheck.in[0] <== privateAvgExecTimeMs;
    execTimeCheck.in[1] <== 10000;
    execTimeCheck.out === 1;
    
    execTimePositive.in[0] <== privateAvgExecTimeMs;
    execTimePositive.in[1] <== 1;
    execTimePositive.out === 1;
    
    reqsCheck.in[0] <== privateReqsPerDay;
    reqsCheck.in[1] <== 1000000;
    reqsCheck.out === 1;
    
    reqsPositive.in[0] <== privateReqsPerDay;
    reqsPositive.in[1] <== 0;
    reqsPositive.out === 1;
    
    deployCheck.in[0] <== privateDeploymentCount;
    deployCheck.in[1] <== 1000;
    deployCheck.out === 1;
    
    deployPositive.in[0] <== privateDeploymentCount;
    deployPositive.in[1] <== 0;
    deployPositive.out === 1;
    
    for (var i = 0; i < maxReviews; i++) {
        reviewCommitment.reviewHashes[i] <== reviewHashes[i];
    }
    
    avgRatingScaled <== avgScaled;
    verifiedNumRatings <== numRatings;
    reviewRoot <== reviewCommitment.reviewRoot;
    uptimeBps <== privateUptimeBps;
    avgExecTimeMs <== privateAvgExecTimeMs;
    reqsPerDay <== privateReqsPerDay;
    deploymentCount <== privateDeploymentCount;
    verifiedAgentId <== agentId;
    verifiedEpochDay <== epochDay;
    
    log("Agent ID:", agentId);
    log("Epoch Day:", epochDay);
    log("Number of ratings:", numRatings);
    log("Rating sum:", ratingValidator.sum);
    log("Average rating (scaled):", avgScaled);
    log("Uptime BPS:", privateUptimeBps);
    log("Avg exec time (ms):", privateAvgExecTimeMs);
    log("Requests per day:", privateReqsPerDay);
    log("Deployment count:", privateDeploymentCount);
    log("Review root hash:", reviewCommitment.reviewRoot);
}

component main { 
    public [ 
        agentId, 
        epochDay, 
        numRatings, 
        claimedUptimeBps, 
        claimedAvgExecTimeMs, 
        claimedReqsPerDay, 
        claimedDeploymentCount 
    ] 
} = AIAgentReputation(20, 16);

/* INPUT = {
    "ratings": [
        "4", "5", "3", "4", "5", "4", "3", "5", "4", "4",
        "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"
    ],
    "reviewHashes": [
        "12345678901234567890123456789012345678901234567890123456789012345678901234567890",
        "98765432109876543210987654321098765432109876543210987654321098765432109876543210",
        "11111111111111111111111111111111111111111111111111111111111111111111111111111111",
        "22222222222222222222222222222222222222222222222222222222222222222222222222222222",
        "33333333333333333333333333333333333333333333333333333333333333333333333333333333",
        "44444444444444444444444444444444444444444444444444444444444444444444444444444444",
        "55555555555555555555555555555555555555555555555555555555555555555555555555555555",
        "66666666666666666666666666666666666666666666666666666666666666666666666666666666",
        "77777777777777777777777777777777777777777777777777777777777777777777777777777777",
        "88888888888888888888888888888888888888888888888888888888888888888888888888888888",
        "0", "0", "0", "0", "0", "0"
    ],
    "privateUptimeBps": "9850",
    "privateAvgExecTimeMs": "150",
    "privateReqsPerDay": "1250",
    "privateDeploymentCount": "3",
    "agentId": "42001",
    "epochDay": "18900",
    "numRatings": "10",
    "claimedUptimeBps": "9850",
    "claimedAvgExecTimeMs": "150",
    "claimedReqsPerDay": "1250",
    "claimedDeploymentCount": "3",
    "avgScaled": "410"
} */

/*
EXPECTED OUTPUTS:
- avgRatingScaled: 410 (4.10 * 100)
- verifiedNumRatings: 10
- reviewRoot: Poseidon hash of all review hashes
- uptimeBps: 9850 (98.50% uptime)
- avgExecTimeMs: 150
- reqsPerDay: 1250
- deploymentCount: 3
- verifiedAgentId: 42001
- verifiedEpochDay: 18900

CALCULATION NOTES:
- Ratings: [4,5,3,4,5,4,3,5,4,4] = sum 41, count 10
- Average: 41/10 = 4.1, scaled: 4.1 * 100 = 410
- Only first 10 ratings used (numRatings=10), rest are padding zeros
- Only first 10 review hashes meaningful, rest are padding zeros
- Uptime: 9850 basis points = 98.50%
- All metrics verified against private inputs
*/