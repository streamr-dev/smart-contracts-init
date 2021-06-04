const fetch = require("node-fetch")
const fs = require("fs")
const Web3 = require("web3")
const {
    Contract,
    ContractFactory,
    utils: {computeAddress, parseEther, formatEther, namehash, bigNumberify},
    Wallet,
    providers: {JsonRpcProvider}
} = require("ethers")


const TokenJson = require("./TestToken.json")
const MarketplaceJson = require("./Marketplace.json")
const Marketplace2Json = require("./Marketplace2.json")
const UniswapAdaptor = require("./UniswapAdaptor.json")
const Uniswap2Adapter = require("./Uniswap2Adapter.json")
const NodeRegistry = require("./NodeRegistry.json")
const ENSRegistry = require("./ENSRegistry.json")
const FIFSRegistrar = require("./FIFSRegistrar.json")
const PublicResolver = require("./PublicResolver.json")
const BinanceAdapter = require("./BinanceAdapter.json")


//Uniswap v2
const UniswapV2Factory = require("./node_modules/@uniswap/v2-core/build/UniswapV2Factory.json")
const UniswapV2Router02 = require("./node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json")
const ExampleSlidingWindowOracle = require("./node_modules/@uniswap/v2-periphery/build/ExampleSlidingWindowOracle.json");

const WETH9 = require("./node_modules/@uniswap/v2-periphery/build/WETH9.json")

//Uniswap v1
const uniswap_exchange_abi = JSON.parse(fs.readFileSync("./abi/uniswap_exchange.json", "utf-8"))
const uniswap_factory_abi = JSON.parse(fs.readFileSync("./abi/uniswap_factory.json", "utf-8"))
const uniswap_exchange_bytecode = fs.readFileSync("./bytecode/uniswap_exchange.txt", "utf-8")
const uniswap_factory_bytecode = fs.readFileSync("./bytecode/uniswap_factory.txt", "utf-8")

// Streamregistry
const LinkToken = require('./LinkToken.json')
const ChainlinkOracle = require('./Oracle.json')
const ENSCache = require('./ENSCache.json')
const StreamRegistry = require('./StreamRegistry.json')

const chainURL = process.env.CHAIN_URL || "http://10.200.10.1:8545"
const sidechainURL = process.env.SIDECHAIN_URL || "http://10.200.10.1:8546"

const streamrUrl = process.env.EE_URL || "http://10.200.10.1:8081/streamr-core" // production: "https://www.streamr.com"
const log = process.env.QUIET ? (() => {
}) : console.log // eslint-disable-line no-console
const futureTime = 4449513600

// Default Private Key
defaultPrivateKey = "0x5e98cce00cff5dea6b454889f359a4ec06b9fa6b88e9d69b86de8e1c81887da0"
privKeyStreamRegistry = "0x4059de411f15511a85ce332e7a428f36492ab4e87c7830099dadbf130f1896ae"

const privateKeys = [
    "0x5e98cce00cff5dea6b454889f359a4ec06b9fa6b88e9d69b86de8e1c81887da0", // used!!
    "0xe5af7834455b7239881b85be89d905d6881dcb4751063897f12be1b0dd546bdb", // used!!
    "0x4059de411f15511a85ce332e7a428f36492ab4e87c7830099dadbf130f1896ae", // used!!
    "0x633a182fb8975f22aaad41e9008cb49a432e9fdfef37f151e9e7c54e96258ef9", // use this for new deployments
    "0x957a8212980a9a39bf7c03dcbeea3c722d66f2b359c669feceb0e3ba8209a297",
    "0xfe1d528b7e204a5bdfb7668a1ed3adfee45b4b96960a175c9ef0ad16dd58d728",
    "0xd7609ae3a29375768fac8bc0f8c2f6ac81c5f2ffca2b981e6cf15460f01efe14",
    "0xb1abdb742d3924a45b0a54f780f0f21b9d9283b231a0a0b35ce5e455fa5375e7",
    "0x2cd9855d17e01ce041953829398af7e48b24ece04ff9d0e183414de54dc52285",
    "0x2c326a4c139eced39709b235fffa1fde7c252f3f7b505103f7b251586c35d543",
]

// these come from the next step, but we can predict the addresses
const sidechainDataCoin = '0x73Be21733CC5D08e1a14Ea9a399fb27DB3BEf8fF'
const sidechainSingleTokenMediator = '0xedD2aa644a6843F2e5133Fe3d6BD3F4080d97D9F'
const chainlinkNodeAddress = '0xDf0107F91ECCD830Ca0f0697AD42259aE3459097'
const chainlinkJobId = 'c0d1fe92d7f24c5db7888198f5afaa88'

async function getProducts() {
    return await (await fetch(`${streamrUrl}/api/v1/products?publicAccess=true`)).json()
}
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

//from https://github.com/ethers-io/ethers.js/issues/319
class AutoNonceWallet extends Wallet {
    _noncePromise = null;
    sendTransaction(transaction) {
        if (transaction.nonce == null) {
            if (this._noncePromise == null) {
                this._noncePromise = this.provider.getTransactionCount(this.address);
            }
            transaction.nonce = this._noncePromise;
            this._noncePromise = this._noncePromise.then((nonce) => (nonce + 1))
        }
        return super.sendTransaction(transaction);
    }
}



/**
 * 
 * From https://github.com/ensdomains/ens/blob/master/migrations/2_deploy_contracts.js
 * 
 * Calculate root node hashes given the top level domain(tld)
 *
 * @param {string} tld plain text tld, for example: 'eth'
 */
function getRootNodeFromTLD(tld) {
    return {
      namehash: namehash(tld),
      sha3: Web3.utils.sha3(tld)
    };
  }


async function deployNodeRegistry(wallet, initialNodes, initialMetadata) {
    const strDeploy = new ContractFactory(NodeRegistry.abi, NodeRegistry.bytecode, wallet)
    const strDeployTx = await strDeploy.deploy(wallet.address, false, initialNodes, initialMetadata, {gasLimit: 6000000} )
    const str = await strDeployTx.deployed()
    log(`NodeRegistry deployed at ${str.address}`)
    let nodes = await str.getNodes();
    log(`NodeRegistry nodes : ${JSON.stringify(nodes)}`)
}

async function deployUniswap2(wallet) {
    let deployer = new ContractFactory(WETH9.abi, WETH9.bytecode, wallet)
    let tx = await deployer.deploy()
    const weth = await tx.deployed()
    log(`WETH deployed to ${weth.address}`)
    
    deployer = new ContractFactory(UniswapV2Factory.abi, UniswapV2Factory.bytecode, wallet)
    tx = await deployer.deploy(wallet.address)
    const factory = await tx.deployed()
    log(`Uniswap2 factory deployed to ${factory.address}`)

    deployer = new ContractFactory(UniswapV2Router02.abi, UniswapV2Router02.bytecode, wallet)
    tx = await deployer.deploy(factory.address, weth.address)
    const router = await tx.deployed()
    log(`Uniswap2 router deployed to ${router.address}`)
    return router
}

async function ethersWallet(url, privateKey) {
    let provider = await new JsonRpcProvider(url);
    try {
        await provider.getNetwork()
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
    return new AutoNonceWallet(privateKey, provider)
}

async function deployStreamRegistry() {
    const sidechainWalletStreamReg = await ethersWallet(sidechainURL, privKeyStreamRegistry)

    log('Sending some Ether to chainlink node address')
    await sidechainWalletStreamReg.sendTransaction({
        to: chainlinkNodeAddress,
        value: parseEther('100')
    })
    
    log('Deploying Streamregistry and chainlink contracts to sidechain:')
    const linkTokenFactory = new ContractFactory(LinkToken.abi, LinkToken.bytecode, sidechainWalletStreamReg)
    const linkTokenFactoryTx = await linkTokenFactory.deploy()
    const linkToken = await linkTokenFactoryTx.deployed()
    log(`Link Token deployed at ${linkToken.address}`)

    const oracleFactory = new ContractFactory(ChainlinkOracle.compilerOutput.abi,
        ChainlinkOracle.compilerOutput.evm.bytecode.object, sidechainWalletStreamReg)
    const oracleFactoryTx = await oracleFactory.deploy(linkToken.address)
    const oracle = await oracleFactoryTx.deployed()
    log(`Chainlink Oracle deployed at ${oracle.address}`)
    const tokenaddrFromOracle = await oracle.getChainlinkToken()
    log(`Chainlink Oracle token pointing to ${tokenaddrFromOracle}`)
    await oracle.setFulfillmentPermission(chainlinkNodeAddress, true)
    const permission = await oracle.getAuthorizationStatus(chainlinkNodeAddress)
    log(`Chainlink Oracle permission for ${chainlinkNodeAddress} is ${permission}`)

    const ensCacheFactory = new ContractFactory(ENSCache.abi, ENSCache.bytecode, sidechainWalletStreamReg)
    const ensCacheFactoryTx = await ensCacheFactory.deploy(oracle.address, chainlinkJobId)
    const ensCache = await ensCacheFactoryTx.deployed()
    log(`ENSCache deployed at ${ensCache.address}`)
    log(`ENSCache setting Link token address ${linkToken.address}`)
    await ensCache.setChainlinkTokenAddress(linkToken.address)

    log('Sending some Link to ENSCache')
    await linkToken.transfer(ensCache.address, bigNumberify('1000000000000000000000')) // 1000 link

    const streamRegistryFactory = new ContractFactory(StreamRegistry.abi, StreamRegistry.bytecode, sidechainWalletStreamReg)
    const streamRegistryFactoryTx = await streamRegistryFactory.deploy(ensCache.address, sidechainWalletStreamReg.address)
    const streamRegistry = await streamRegistryFactoryTx.deployed()
    log(`Streamregistry deployed at ${streamRegistry.address}`)
}

async function smartContractInitialization() {
    const wallet = await ethersWallet(chainURL, defaultPrivateKey)
    const sidechainWallet = await ethersWallet(sidechainURL, defaultPrivateKey)

    log(`Deploying test DATAcoin from ${wallet.address}`)
    const tokenDeployer = await new ContractFactory(TokenJson.abi, TokenJson.bytecode, wallet)
    const tokenDeployTx = await tokenDeployer.deploy("Test DATAcoin", "\ud83e\udd84")
    const token = await tokenDeployTx.deployed()
    log(`DATACOIN ERC20 deployed at ${token.address}`)

    log(`Deploying Marketplace1 contract from ${wallet.address}`)
    const marketDeployer1 = new ContractFactory(MarketplaceJson.abi, MarketplaceJson.bytecode, wallet)
    const marketDeployTx1 = await marketDeployer1.deploy(token.address, wallet.address)
    const market1 = await marketDeployTx1.deployed()
    log(`Marketplace1 deployed at ${market1.address}`)

    log(`Deploying Marketplace2 contract from ${wallet.address}`)
    const marketDeployer2 = new ContractFactory(Marketplace2Json.abi, Marketplace2Json.bytecode, wallet)
    const marketDeployTx2 = await marketDeployer2.deploy(token.address, wallet.address, market1.address)
    const market = await marketDeployTx2.deployed()
    log(`Marketplace2 deployed at ${market.address}`)

    log(`Deploying Uniswap Factory contract from ${wallet.address}`)
    const uniswapFactoryDeployer = new ContractFactory(uniswap_factory_abi, uniswap_factory_bytecode, wallet)
    const uniswapFactoryDeployTx = await uniswapFactoryDeployer.deploy()
    const uniswapFactory = await uniswapFactoryDeployTx.deployed()
    log(`Uniswap factory deployed at ${uniswapFactory.address}`)

    log(`Deploying Uniswap Exchange template contract from ${wallet.address}`)
    const uniswapExchangeDeployer = new ContractFactory(uniswap_exchange_abi, uniswap_exchange_bytecode, wallet)
    const uniswapExchangeDeployTx = await uniswapExchangeDeployer.deploy()
    const uniswapExchangeTemplate = await uniswapExchangeDeployTx.deployed()
    log(`Uniswap exchange template deployed at ${uniswapExchangeTemplate.address}`)

    log(`Deploying UniswapAdaptor contract from ${wallet.address}`)
    const uniswapAdaptorDeployer = new ContractFactory(UniswapAdaptor.abi, UniswapAdaptor.bytecode, wallet)
    const uniswapAdaptorDeployTx = await uniswapAdaptorDeployer.deploy(market.address, uniswapFactory.address, token.address)
    const uniswapAdaptor = await uniswapAdaptorDeployTx.deployed()
    log(`UniswapAdaptor deployed at ${uniswapAdaptor.address}`)

    //another ERC20 that's not datacoin for testing buy with Uniswap
    log(`Deploying test OTHERcoin from ${wallet.address}`)
    const tokenDeployer2 = new ContractFactory(TokenJson.abi, TokenJson.bytecode, wallet)
    const tokenDeployTx2 = await tokenDeployer2.deploy("Test OTHERcoin", "\ud83e\udd84")
    const token2 = await tokenDeployTx2.deployed()
    
    //Note: TestToken contract automatically mints 100000 to owner

    //1000 DATA tokens
    const mintTokens = "1000000000000000000000"
    log(`Minting ${mintTokens} tokens to following addresses:`)
    for (const address of privateKeys.map(computeAddress)) {
        log("    " + address)
        const mintTx = await token.mint(address, mintTokens)
        //await mintTx.wait()
    }

    log("Init Uniswap1 factory")
    let tx = await uniswapFactory.initializeFactory(uniswapExchangeTemplate.address)
    //await tx.wait()
    log(`Init Uniswap1 exchange for DATAcoin token ${token.address}`)
    tx = await uniswapFactory.createExchange(token.address, {gasLimit: 6000000})
    //await tx.wait()
    log(`Init Uniswap1 exchange for OTHERcoin token ${token2.address}`)
    tx = await uniswapFactory.createExchange(token2.address, {gasLimit: 6000000})
    // need wait here to call read methods below
    await tx.wait()

    let datatoken_exchange_address = await uniswapFactory.getExchange(token.address)
    log(`DATAcoin traded at Uniswap1 exchange ${datatoken_exchange_address}`)
    let othertoken_exchange_address = await uniswapFactory.getExchange(token2.address)
    log(`OTHERcoin traded at Uniswap1 exchange ${othertoken_exchange_address}`)
    let datatokenExchange = new Contract(datatoken_exchange_address, uniswap_exchange_abi, wallet)
    let othertokenExchange = new Contract(othertoken_exchange_address, uniswap_exchange_abi, wallet)

    // wallet starts with 1000 ETH and 100000 of each token
    // add 10 ETH liquidity to tokens, set initial exchange rates
    let amt_eth = parseEther("40")
    let amt_token = parseEther("1000") // 1 ETH ~= 10 DATAcoin
    let amt_token2 = parseEther("10000") // 1 ETH ~= 100 OTHERcoin

    tx = await token.approve(datatoken_exchange_address, amt_token)
    //await tx.wait()
    tx = await token2.approve(othertoken_exchange_address, amt_token2)
    //await tx.wait()

    tx = await datatokenExchange.addLiquidity(amt_token, amt_token, futureTime, {gasLimit: 6000000, value: amt_eth})
    //await tx.wait()
    tx = await othertokenExchange.addLiquidity(amt_token2, amt_token2, futureTime, {gasLimit: 6000000, value: amt_eth})
    //await tx.wait()

    log(`Added liquidity to uniswap exchanges: ${formatEther(amt_token)} DATAcoin, ${formatEther(amt_token2)} OTHERcoin`)

    log(`Deploying NodeRegistry contract 1 (tracker registry) from ${wallet.address}`)
    var initialNodes = []
    var initialMetadata = []
    initialNodes.push('0xb9e7cEBF7b03AE26458E32a059488386b05798e8')
    initialMetadata.push('{"ws": "ws://10.200.10.1:30301", "http": "http://10.200.10.1:30301"}')
    initialNodes.push('0x0540A3e144cdD81F402e7772C76a5808B71d2d30')
    initialMetadata.push('{"ws": "ws://10.200.10.1:30302", "http": "http://10.200.10.1:30302"}')
    initialNodes.push('0xf2C195bE194a2C91e93Eacb1d6d55a00552a85E2')
    initialMetadata.push('{"ws": "ws://10.200.10.1:30303", "http": "http://10.200.10.1:30303"}')
    //1st NodeRegistry deployed here. 2nd below
    await deployNodeRegistry(wallet, initialNodes, initialMetadata)

    const ethwei = parseEther("1")
    let rate = await datatokenExchange.getTokenToEthInputPrice(ethwei)
    log(`1 DATAtoken buys ${formatEther(rate)} ETH`)
    rate = await othertokenExchange.getTokenToEthInputPrice(ethwei)
    log(`1 OTHERtoken buys ${formatEther(rate)} ETH`)


    //deployment steps based on https://github.com/ensdomains/ens/blob/2a6785c3b5fc27269eb3bb18b9d1245d1f01d6c8/migrations/2_deploy_contracts.js#L30
    log("Deploying ENS")
    const ensDeploy = new ContractFactory(ENSRegistry.abi, ENSRegistry.bytecode, wallet)
    const ensDeployTx = await ensDeploy.deploy()
    const ens = await ensDeployTx.deployed()
    log(`ENS deployed at ${ens.address}`)
    const rootNode = getRootNodeFromTLD('eth')
    log("Deploying FIFSRegistrar")
    const fifsDeploy = new ContractFactory(FIFSRegistrar.abi, FIFSRegistrar.bytecode, wallet)
    const fifsDeployTx = await fifsDeploy.deploy(ens.address, rootNode.namehash)
    const fifs = await fifsDeployTx.deployed()
    log(`FIFSRegistrar deployed at ${fifs.address}`)
    tx = await ens.setSubnodeOwner('0x0000000000000000000000000000000000000000000000000000000000000000', rootNode.sha3, fifs.address)
    await tx.wait()
    const resDeploy = new ContractFactory(PublicResolver.abi, PublicResolver.bytecode, wallet)
    const resDeployTx = await resDeploy.deploy(ens.address)
    const resolver = await resDeployTx.deployed()
    log(`PublicResolver deployed at ${resolver.address}`)

    const domains = ['testdomain1', 'testdomain2']
    const addresses = ['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0', '0xdC353aA3d81fC3d67Eb49F443df258029B01D8aB']
    for (var i = 0; i < domains.length; i++){
        const domain = domains[i]
        const owner = wallet.address
        const domainAddress = addresses[i]
        const fullname = domain + ".eth"
        const fullhash = namehash(fullname)
        
        log(`setting up ENS domain ${domain} with owner ${owner}, pointing to address ${domainAddress}`)
        tx = await fifs.register(Web3.utils.sha3(domain), owner)
        tr = await tx.wait()
        log(`called regsiter`)
        
        tx = await ens.setResolver(fullhash, resolver.address)
        tr = await tx.wait()
        log('called setResolver')
        
        //Ethers wont call the 2-arg setAddr. 60 is default = COIN_TYPE_ETH. 
        //see https://github.com/ensdomains/resolvers/blob/master/contracts/profiles/AddrResolver.sol
        tx = await resolver.setAddr(fullhash, 60, domainAddress)
        tr = await tx.wait()
        log(`called setAddr. done registering ${fullname} as ${domainAddress}`)
    
        //transfer ownership
        tx = await ens.setOwner(fullhash, addresses[i])
        tr = await tx.wait()
        log(`transferred ownership to ${addresses[i]}`)
    }
    log("ENS init complete")

   //deploy 2nd NodeRegistry:
   log(`Deploying NodeRegistry contract 2 (storage node registry) to sidechain from ${sidechainWallet.address}`)
   initialNodes = []
   initialMetadata = []
   initialNodes.push('0xde1112f631486CfC759A50196853011528bC5FA0')
   initialMetadata.push('{"http": "http://10.200.10.1:8891"}')
   await deployNodeRegistry(sidechainWallet, initialNodes, initialMetadata)

   log(`deploy Uniswap2 mainnet`)
   const router = await deployUniswap2(wallet)
   log(`deploy Uniswap2 sidechain`)
   const uniswapRouterSidechain = await deployUniswap2(sidechainWallet)
   
   tx = await token.approve(router.address, amt_token)
   //await tx.wait()
   tx = await token2.approve(router.address, amt_token2)
   await tx.wait()
   log(`addLiquidity Uniswap2 mainnet`)
   tx = await router.addLiquidity(token.address, token2.address, amt_token, 
   amt_token2, 0, 0, wallet.address, futureTime)
   
   let cf = new ContractFactory(Uniswap2Adapter.abi, Uniswap2Adapter.bytecode, wallet)
   let dtx = await cf.deploy(market.address, router.address, token.address)
   const uniswap2Adapter = await dtx.deployed()
   log(`Uniswap2Adapter ${uniswap2Adapter.address}`)    

   cf = new ContractFactory(BinanceAdapter.abi, BinanceAdapter.bytecode, sidechainWallet)
   //constructor(address dataCoin_, address honeyswapRouter_, address bscBridge_, address convertToCoin_, address liquidityToken_) public {
   dtx = await cf.deploy(sidechainDataCoin, uniswapRouterSidechain.address, sidechainSingleTokenMediator, sidechainDataCoin, sidechainDataCoin)
   const binanceAdapter = await dtx.deployed()
   log(`sidechain binanceAdapter ${binanceAdapter.address}`)

   await deployStreamRegistry()

   //put additions here
 

   //all TXs should now be confirmed:
    const EEwaitms = 60000
    log("Getting products from E&E")
    log(`waiting ${EEwaitms}ms for E&E to start`)
    await sleep(EEwaitms)
    // this get the products and also checks if EE is up
    let products
    try {
        products = await getProducts()
    } catch (e) {
        console.error(e)
        process.exit(1)
    }


    log(`Adding ${products.length} products to Marketplace`)
    for (const p of products) {
        // free products not supported
        if (p.pricePerSecond == 0) {
            continue
        }
        console.log(`create ${p.id}`)
        const tx = await market.createProduct(`0x${p.id}`, p.name, wallet.address, p.pricePerSecond, p.priceCurrency == "DATA" ? 0 : 1, p.minimumSubscriptionInSeconds)
        //await tx.wait(1)
        if (p.state == "NOT_DEPLOYED") {
            console.log(`delete ${p.id}`)
            await tx.wait(1)
            const tx2 = await market.deleteProduct(`0x${p.id}`)
            //await tx2.wait(1)
        }
    }
}

smartContractInitialization()
