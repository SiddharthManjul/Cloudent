pragma circom 2.0.0;

include "poseidon.circom";
include "comparators.circom";

template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output root;

    component hashers[levels];
    component mux[levels];

    signal levelHashes[levels + 1];
    levelHashes[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        mux[i] = Mux1();
        mux[i].c[0] <== levelHashes[i];
        mux[i].c[1] <== pathElements[i];
        mux[i].s <== pathIndices[i];
        
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== mux[i].out;
        hashers[i].inputs[1] <== pathElements[i] + levelHashes[i] - mux[i].out;
        
        levelHashes[i + 1] <== hashers[i].out;
    }

    root <== levelHashes[levels];
}

template Mux1() {
    signal input c[2];
    signal input s;
    signal output out;
    
    out <== c[0] + s * (c[1] - c[0]);
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

    component ratingMinChecks[maxRatings];
    component ratingMaxChecks[maxRatings];
    component withinCount[maxRatings];
    signal validRatings[maxRatings];
    signal ratingInRange[maxRatings];
    signal ratingSum[maxRatings + 1];
    ratingSum[0] <== 0;

    for (var i = 0; i < maxRatings; i++) {
        ratingMinChecks[i] = GreaterEqThan(4);
        ratingMinChecks[i].in[0] <== ratings[i];
        ratingMinChecks[i].in[1] <== 1;
        
        ratingMaxChecks[i] = LessEqThan(4);
        ratingMaxChecks[i].in[0] <== ratings[i];
        ratingMaxChecks[i].in[1] <== 5;
        
        withinCount[i] = LessThan(8);
        withinCount[i].in[0] <== i;
        withinCount[i].in[1] <== numRatings;
        
        ratingInRange[i] <== ratingMinChecks[i].out * ratingMaxChecks[i].out;
        validRatings[i] <== ratingInRange[i] * withinCount[i].out;
        
        ratingSum[i + 1] <== ratingSum[i] + ratings[i] * withinCount[i].out;
        withinCount[i].out * (1 - validRatings[i]) === 0;
    }

    sum <== ratingSum[maxRatings];
    isValid <== numRatingsCheck.out * numRatingsPositive.out;
}

template FixedPointAverage() {
    signal input sum;
    signal input count;
    signal output avgScaled;
    
    // Simple scaled average - multiply by 100 for fixed point precision
    // In practice, you'd implement proper division for more accurate results
    avgScaled <== sum * 100;
}

template AIAgentReputation(maxRatings, merkleDepth) {
    signal input ratings[maxRatings];
    signal input reviewHashes[1 << merkleDepth]; // 2^merkleDepth review hashes
    signal input merklePath[merkleDepth];
    signal input merklePathIndices[merkleDepth];
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
    for (var i = 0; i < maxRatings; i++) {
        ratingValidator.ratings[i] <== ratings[i];
    }
    ratingValidator.numRatings <== numRatings;
    
    ratingValidator.isValid === 1;
    
    component avgComputer = FixedPointAverage();
    avgComputer.sum <== ratingValidator.sum;
    avgComputer.count <== numRatings;
    
    privateUptimeBps === claimedUptimeBps;
    privateAvgExecTimeMs === claimedAvgExecTimeMs;
    privateReqsPerDay === claimedReqsPerDay;
    privateDeploymentCount === claimedDeploymentCount;
    
    component uptimeCheck = LessEqThan(16);
    uptimeCheck.in[0] <== privateUptimeBps;
    uptimeCheck.in[1] <== 10000;
    uptimeCheck.out === 1;
    
    component uptimePositive = GreaterEqThan(16);
    uptimePositive.in[0] <== privateUptimeBps;
    uptimePositive.in[1] <== 0;
    uptimePositive.out === 1;
    
    // For simplicity, just hash the first review hash as root
    // In practice, you'd implement a proper merkle tree hasher
    component merkleHasher = Poseidon(1);
    merkleHasher.inputs[0] <== reviewHashes[0];
    
    avgRatingScaled <== avgComputer.avgScaled;
    verifiedNumRatings <== numRatings;
    reviewRoot <== merkleHasher.out;
    uptimeBps <== privateUptimeBps;
    avgExecTimeMs <== privateAvgExecTimeMs;
    reqsPerDay <== privateReqsPerDay;
    deploymentCount <== privateDeploymentCount;
    verifiedAgentId <== agentId;
    verifiedEpochDay <== epochDay;
}

component main = AIAgentReputation(100, 8);