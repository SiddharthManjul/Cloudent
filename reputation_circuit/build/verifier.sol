// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 1934869471365711249578820785741525711209241972247245136022550638254305767840;
    uint256 constant alphay  = 12337151012528993998472588235042441842519339456907046045146066852971863936424;
    uint256 constant betax1  = 3761597217258474575701312554161753470743610593208087703265127235953840848892;
    uint256 constant betax2  = 19998287002935995518265737253729302878292212519769943665976865349454549436853;
    uint256 constant betay1  = 17800672799348586585528677741255987768064939256685400060098471057450195798465;
    uint256 constant betay2  = 21302746916998766864813772554646494677797087720441922953705399630449917490323;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 1374604101220941222211416920007891704870990441847383927169134204199136196936;
    uint256 constant deltax2 = 8116246076976148498409574741332224603369088249966851423044211895046797502483;
    uint256 constant deltay1 = 5261029414957272820230887324630007631811934666113465878717549040436972817368;
    uint256 constant deltay2 = 6825782593481393687288359608646332341038235882096286530217266700011503310578;

    
    uint256 constant IC0x = 14328238192410412990045860165555648187205583819689410955934201874623651461703;
    uint256 constant IC0y = 5319506193280375210644336469717920003793701914767391235272547781326877609190;
    
    uint256 constant IC1x = 2022833343152613191737526347013399106564463098031999461012939204268558961810;
    uint256 constant IC1y = 5578710519843832093034489871971654117542382864394415922861553521580492261648;
    
    uint256 constant IC2x = 6898191662044879449815647331428111349309376548271298852736045607531384756626;
    uint256 constant IC2y = 14764906113697007196377498711817516170784289587919194175748089317495542728605;
    
    uint256 constant IC3x = 16970723666362675006889432857243916442363816150263942254305957727306351664543;
    uint256 constant IC3y = 15975437414626940254453439080796431998442682743473600600393250387874931440470;
    
    uint256 constant IC4x = 1239200864665000000956101290538000610510389251349450386052541938871745659656;
    uint256 constant IC4y = 2704920057607352291353183163362096752717652802889023852325469893703686339829;
    
    uint256 constant IC5x = 9181107123824249795652333533288209830328034495498535960053387018316012723777;
    uint256 constant IC5y = 13409339600350342502124342695825742770496599121542747916551484039200327208330;
    
    uint256 constant IC6x = 15242621302204373285896967348381736017745483266481761317493742542559386855402;
    uint256 constant IC6y = 2849965010830740094219994900661054034996664934428349711006740842566780253092;
    
    uint256 constant IC7x = 16116283813983963432491037109745799814335785472431099679132700372067610014093;
    uint256 constant IC7y = 16030643457410341486598444949785747938064811481107399214042775300452650177685;
    
    uint256 constant IC8x = 9936729394093328263159772209518834570860038951107240530056738496112883555377;
    uint256 constant IC8y = 16690950633562966163025789421930923375307963587995459225079458190200768442582;
    
    uint256 constant IC9x = 18837738743439089232302514976224597117683201372273729838521798016099707237732;
    uint256 constant IC9y = 14162161460440122324005642718525576504398693306805831704169338796783555014642;
    
    uint256 constant IC10x = 4633744648425566691322541974480043478873784874040477114594113248523425503762;
    uint256 constant IC10y = 13364214302242082670714423623646894638268612879063507156389216650276124345882;
    
    uint256 constant IC11x = 8023430114396983830576425343481419968959604459583170860321020154024946688552;
    uint256 constant IC11y = 15016613113114086059117615961411958434602927942188753113578139117747522298463;
    
    uint256 constant IC12x = 21498772655602140054928239575549926425711887286564487454321834685842319252587;
    uint256 constant IC12y = 19807883835504280805836037392592676477925756297111292781874009310775411373027;
    
    uint256 constant IC13x = 16925282395461151864492530269430662520304101482646247582168586420355219602615;
    uint256 constant IC13y = 9366484338375071205598962310079462280510749752419269454401576241711680155382;
    
    uint256 constant IC14x = 9703588507916704978422279524684761881467034049591377655701438207598096039952;
    uint256 constant IC14y = 18021950052350780272491200937991811047486265442622046527829635659278833292864;
    
    uint256 constant IC15x = 11695146268738817090399623635643540721654366888773899152246385137729651521720;
    uint256 constant IC15y = 13456906532194728596405780625290321183020634105277268631892308559137055826776;
    
    uint256 constant IC16x = 2370112292496922625519048842150067562212494109841523979104292938585019338703;
    uint256 constant IC16y = 1922364010686399833346013793947932673858259334850674181404267920905642103546;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[16] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            
            checkField(calldataload(add(_pubSignals, 480)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
