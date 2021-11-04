#!/bin/bash -eux

node index.js
./bridge/deploy_bridge_and_du2.sh

# wait until index.js finishes
until [ -f addresses.json ];
do
  sleep 5s
done

jq -s '.[0] * .[1]' addresses.json bridge/du-addresses.json > config.json
