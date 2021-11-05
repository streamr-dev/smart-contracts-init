#!/bin/bash -eux

# This file is run from Dockerfile, everything happens inside the streamr-dev-smart-contracts-init container.

node index.js
./bridge/deploy_bridge_and_du2.sh

# wait until index.js finishes
until [ -f addresses.json ];
do
  sleep 5s
done

# The resulting config.json is copied out of the container to the host in preload_parity_images.sh
jq -s '.[0] * .[1]' addresses.json bridge/du-addresses.json > output/config.json
