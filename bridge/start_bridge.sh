#!/bin/bash -eux
cd `dirname $0`

AMBTASK="deploy_amb"
AMBRESULTS="bridgeDeploymentResultsAMB.json"

ERC677TASK="deploy_erc677"
ERC677RESULTS="bridgeDeploymentResultsERC677.json"

#$DU2_HOME=${DU2_HOME:-../}

echo "1. Deploying AMB"
#docker run --name $AMBTASK --env-file amb.env poanetwork/tokenbridge-contracts deploy.sh
#docker cp $AMBTASK:/contracts/deploy/bridgeDeploymentResults.json $AMBRESULTS

HOME_AMB_BRIDGE=`jq -r .homeBridge.address < $AMBRESULTS`
FOREIGN_AMB_BRIDGE=`jq -r .foreignBridge.address < $AMBRESULTS`

echo "2. Deploying ERC677 mediator over AMB"
ENV="-e HOME_AMB_BRIDGE=$HOME_AMB_BRIDGE -e FOREIGN_AMB_BRIDGE=$FOREIGN_AMB_BRIDGE"
#docker run --name $ERC677TASK $ENV --env-file erc677.env poanetwork/tokenbridge-contracts deploy.sh
#docker cp $ERC677TASK:/contracts/deploy/bridgeDeploymentResults.json $ERC677RESULTS

HOME_ERC677_MEDIATOR=`jq -r .homeBridge.homeBridgeMediator.address < $ERC677RESULTS`
FOREIGN_ERC677_MEDIATOR=`jq -r .foreignBridge.foreignBridgeMediator.address < $ERC677RESULTS`

echo "3. Starting Oracles"
echo "COMMON_HOME_BRIDGE_ADDRESS=$HOME_AMB_BRIDGE" >> .env
echo "COMMON_FOREIGN_BRIDGE_ADDRESS=$FOREIGN_AMB_BRIDGE" >> .env
docker-compose -f docker-compose-bridge-oracles.yml up

echo "4. Deploying DataUnion and Factory Contracts"
