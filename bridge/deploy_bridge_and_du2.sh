#!/bin/bash -eux
cd `dirname $0`

AMBTASK="deploy_amb"
AMBRESULTS="bridgeDeploymentResultsAMB.json"

ERC677TASK="deploy_erc677"
ERC677RESULTS="bridgeDeploymentResultsERC677.json"

echo "1. Deploying AMB"
docker run --name $AMBTASK --env-file amb.env poanetwork/tokenbridge-contracts deploy.sh
docker cp $AMBTASK:/contracts/deploy/bridgeDeploymentResults.json $AMBRESULTS

export HOME_AMB_BRIDGE=`jq -r .homeBridge.address < $AMBRESULTS`
export FOREIGN_AMB_BRIDGE=`jq -r .foreignBridge.address < $AMBRESULTS`

echo "2. Deploying ERC677 mediator over AMB"
ENV="-e HOME_AMB_BRIDGE=$HOME_AMB_BRIDGE -e FOREIGN_AMB_BRIDGE=$FOREIGN_AMB_BRIDGE"
# we replace the default mediator with a mediator that calls transferAndCall()
# this is a temp fix and should be removed when tokenbridge supports callback:
VOLS="-v `pwd`/HomeAMBErc677ToErc677.json:/contracts/build/contracts/HomeAMBErc677ToErc677.json"
docker run --name $ERC677TASK $ENV $VOLS --env-file erc677.env poanetwork/tokenbridge-contracts deploy.sh
docker cp $ERC677TASK:/contracts/deploy/bridgeDeploymentResults.json $ERC677RESULTS

docker rm $AMBTASK $ERC677TASK

source erc677.env
export ERC20_TOKEN_ADDRESS
export HOME_ERC677_MEDIATOR=`jq -r .homeBridge.homeBridgeMediator.address < $ERC677RESULTS`
export HOME_ERC677=`jq -r .homeBridge.bridgeableErc677.address < $ERC677RESULTS`
export FOREIGN_ERC677_MEDIATOR=`jq -r .foreignBridge.foreignBridgeMediator.address < $ERC677RESULTS`

echo "3. Deploying DataUnion and Factory Contracts"
node ../deploy_du2_factories.js
