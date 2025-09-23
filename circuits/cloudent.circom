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


