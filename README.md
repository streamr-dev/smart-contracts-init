# Smart Contract init
This repo is used to build the parity images for mainchain and sidechain preloaded with:
 1. Streamr's smart contracts: Marketplace Uniswap Adaptor, loads products,
 2. The token bridge (AMB) and mediator
 3. the DU2 factories and templates. 

smart-contracts-init container is no longer part of streamr-docker-dev. Instead we use the docker-compose.yml file here to build the preloaded parity images streamr/open-ethereum-poa-mainchain-preload1 and streamr/open-ethereum-poa-sidechain-preload1.

To build images:
./preload_parity_images.sh

This will tag the images locally and echo the command to push to dockerhub.


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
* NodeRegistry: 0xBFCF120a8fD17670536f1B27D9737B775b2FD4CF

Bridge Address:
* home_amb: 0xE4eA76e830a659282368cA2e7E4d18C4AE52D8B3
* foreign_amb: 0xD13D34d37e2c94cb35EA8D5DE7498Cb7830d26e0
* home_erc677: 0x3b11D489411BF11e843Cb28f8824dedBfcB75Df3
* home_erc_mediator: 0x6cCdd5d866ea766f6DF5965aA98DeCCD629ff222
* foreign_erc_mediator: 0x3AE0ad89b0e094fD09428589849C161f0F7f4E6A
* foreign_erc20: 0xbAA81A0179015bE47Ad439566374F2Bae098686F
* home_du_factory: 0xA90CeCcA042312b8f2e8B924C04Ce62516CBF7b2
* foreign_du_factory: 0xb23dffE7267Ec8ffcE409D5623B7a73f536e7D9B

