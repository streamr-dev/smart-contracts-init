# Smart Contract init
This repo is used to build the parity images streamr/open-ethereum-poa-mainchain-preload1 and streamr/open-ethereum-poa-sidechain-preload1, which are preloaded mainchain and sidechain images for use with streamr-docker.dev. The following are setup:
 1. Streamr's smart contracts: Marketplace Uniswap Adaptor, loads products,
 2. The token bridge (AMB) and mediator
 3. the DU2 factories and templates. 
 
smart-contracts-init container is no longer part of streamr-docker-dev. Instead we use the docker-compose.yml file here to build the preloaded parity images 

Dependencies:
Build and tag required docker images.
 1. git clone https://github.com/poanetwork/omnibridge.git; cd omnibridge; docker build . -t 'poanetwork/omnibridge'
 2. git clone https://github.com/streamr-dev/tokenbridge-contracts.git; cd tokenbridge-contracts; docker build . -t 'streamr-dev/tokenbridge-contracts' 

To build images:
./preload_parity_images.sh

This will tag the images locally and echo the command to push to dockerhub.

Tokenbridge:
The bridge dir contains code related to the setup of tokenbridge between the mainchain and sidechain images. bridge/tokenbridge-contracts contains some custom modifications Streamr has made to tokenbridge contracts. When tokenbridge implements transferAndCall for bridge tokens, this should be REPLACED with the tokenbridge image.

Parity Default Private Key 
* 0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7

Private Keys:
* 0x5e98cce00cff5dea6b454889f359a4ec06b9fa6b88e9d69b86de8e1c81887da0,
* 0xe5af7834455b7239881b85be89d905d6881dcb4751063897f12be1b0dd546bdb,
* 0x4059de411f15511a85ce332e7a428f36492ab4e87c7830099dadbf130f1896ae,
* 0x633a182fb8975f22aaad41e9008cb49a432e9fdfef37f151e9e7c54e96258ef9,
* 0x957a8212980a9a39bf7c03dcbeea3c722d66f2b359c669feceb0e3ba8209a297,
* 0xfe1d528b7e204a5bdfb7668a1ed3adfee45b4b96960a175c9ef0ad16dd58d728,
* 0xd7609ae3a29375768fac8bc0f8c2f6ac81c5f2ffca2b981e6cf15460f01efe14,
* 0xb1abdb742d3924a45b0a54f780f0f21b9d9283b231a0a0b35ce5e455fa5375e7,
* 0x2cd9855d17e01ce041953829398af7e48b24ece04ff9d0e183414de54dc52285,
* 0x2c326a4c139eced39709b235fffa1fde7c252f3f7b505103f7b251586c35d543,


Generates the following Ethereum addresses:
* DATAcoin address: 0xbAA81A0179015bE47Ad439566374F2Bae098686F
* Marketplace2 address: 0xF1371c0f40528406dc4f4cAf89924eA9Da49E866
* OTHERcoin address: 0x642D2B84A32A9A92FEc78CeAA9488388b3704898
* UniswapAdaptor address: 0xE4eA76e830a659282368cA2e7E4d18C4AE52D8B3
* UniswapFactory address: 0xd2D23b73A67208a90CBfEE1381415329954f54E2
* Tracker NodeRegistry: 0xBFCF120a8fD17670536f1B27D9737B775b2FD4CF
* Storage NodeRegistry: 0x2B8c1877dE5531a345c2c8335c72A8d7556861AA

Bridge Addresses:
* home_amb: 0xaFA0dc5Ad21796C9106a36D68f69aAD69994BB64
* foreign_amb: 0xaFA0dc5Ad21796C9106a36D68f69aAD69994BB64
* home_erc677: 0x73Be21733CC5D08e1a14Ea9a399fb27DB3BEf8fF
* home_erc_mediator: 0xedD2aa644a6843F2e5133Fe3d6BD3F4080d97D9F
* foreign_erc_mediator: 0xedD2aa644a6843F2e5133Fe3d6BD3F4080d97D9F
* foreign_erc20: 0xbAA81A0179015bE47Ad439566374F2Bae098686F
* home_du_factory: 0x4081B7e107E59af8E82756F96C751174590989FE
* foreign_du_factory: 0x5E959e5d5F3813bE5c6CeA996a286F734cc9593b

ENS:
* ENS: 0x92E8435EB56fD01BF4C79B66d47AC1A94338BB03
* FIFSRegistrar for TLD (top level domain) 'eth': 0x57B81a9442805f88c4617B506206531e72d96290
* PublicResolver (reusable): 0xBc0c81a318D57ae54dA28DE69184A9c3aE9a1e1c
