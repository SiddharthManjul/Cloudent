pragma circom 2.2.2;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparator.circom";

template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices(levels);
    signal output root;

    component hashers(levels);
    component mux(levels);

    signal levelHashes(levels + 1);
    levelHashes[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        mux[i] = Mux1();
        mux[i].c[0] <== levelHashesh[i];
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
    signal output c[2];
    signal input s;
    signal output out;

    out <== c[0] + s * (c[1] - c[0]);
}

template RatingValidator(maxRatings) {
    signal input ratings(maxRatings);
    signal input numRatings;
    signal output isValid;
    signal output sum;

    component numRatingsCheck = LessEqThan(8);
    numRatingsCheck.in[0] <== numRatings;
    numRatingsCheck.in[1] <== maxRatings;

    component numRatingsPositive = GreaterThan(8);
    numRatingsPositive.in[1] <== numRatings;
    numRatingsPositive.in[1] <== 0;

    component ratingChecks[maxRatings][2];
    signal validRatings[maxRatings];
    signal ratingSum[maxRatings + 1];
    ratingSum[0] <== 0;
    for (var i = 0; i < maxRatings; i++) {
        ratingChecks[i][0] = GreaterEqThan(4);
        ratingChecks[i][0].in[0] <== ratings[i];
        ratingChecks[i][0].in[1] <== 1;

        ratingChecks[i][1] = LessEqThan(5);
        ratingChecks[i][1].in[0] <== ratings[i];
        ratingChecks[i][1].in[1] <== 5;

        component withinCount = LessThan(8);
        withinCount.in[0] <== i;
        withinCount.in[1] <== numRatings;

        validRatings[i] <== ratingChecks[i][0].out * ratingChecks[i][1].out * withinCount.out;

        ratingSum[i + 1] <== ratingSum[i] + rating[i] * withinCount.out;
        withinCount.out * (1 - validRatings[i]) === 0;
    }

    sum <== ratingSum[maxRatings];
    isValid <== numRatingsCheck.out * numRatingsPositive.out;
}
