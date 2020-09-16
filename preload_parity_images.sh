#!/bin/bash -eux
cd `dirname $0`
docker build -t streamr/smart-contracts-init:dev .
streamr-docker-dev start
streamr-docker-dev stop parity-sidechain-node0 parity-node0
docker-compose up -d
docker wait streamr-dev-smart-contracts-init
docker exec streamr-dev-parity-sidechain-node0 /bin/bash -c 'mv /home/parity/parity_data /home/parity/parity_data.default'
docker exec streamr-dev-parity-node0 /bin/bash -c 'mv /home/parity/parity_data /home/parity/parity_data.default'
streamr-docker-dev stop
docker commit streamr-dev-parity-sidechain-node0 streamr/open-ethereum-poa-sidechain-preload1:dev
docker commit streamr-dev-parity-node0 streamr/open-ethereum-poa-mainchain-preload1:dev
docker-compose stop
docker-compose rm -f
echo "Images created. To push to dockerhub: " 
echo docker push streamr/open-ethereum-poa-sidechain-preload1:dev
echo docker push streamr/open-ethereum-poa-mainchain-preload1:dev
