const fs = require("fs")

const {
    ContractFactory,
    Wallet,
    providers: { JsonRpcProvider }
} = require("ethers")

const DataUnionMainnet = require("./ethereumContractJSONs/DataUnionMainnet.json")
const DataUnionSidechain = require("./ethereumContractJSONs/DataUnionSidechain.json")
const DataUnionFactorySidechain = require("./ethereumContractJSONs/DataUnionFactorySidechain.json")
const DataUnionFactoryMainnet = require("./ethereumContractJSONs/DataUnionFactoryMainnet.json")
const MainnetMigrationManager = require("./ethereumContractJSONs/MainnetMigrationManager.json")
const SidechainMigrationManager = require("./ethereumContractJSONs/SidechainMigrationManager.json")

const log = process.env.QUIET ? (() => { }) : console.log // eslint-disable-line no-console
// class LoggingProvider extends JsonRpcProvider {
//     perform(method, parameters) {
//         console.log(">>>", method, parameters);
//         return super.perform(method, parameters).then((result) => {
//             console.log("<<<", method, parameters, result);
//             return result;
//         });
//     }
// }
const provider_foreign = new JsonRpcProvider('http://10.200.10.1:8545')
const provider_home = new JsonRpcProvider('http://10.200.10.1:8546')

const wallet_home = new Wallet('0xe5af7834455b7239881b85be89d905d6881dcb4751063897f12be1b0dd546bdb', provider_home)
const wallet_foreign = new Wallet('0xe5af7834455b7239881b85be89d905d6881dcb4751063897f12be1b0dd546bdb', provider_foreign)
const home_erc_mediator = process.env.HOME_ERC677_MEDIATOR
const foreign_erc_mediator = process.env.FOREIGN_ERC677_MEDIATOR

const foreign_erc20 = process.env.ERC20_TOKEN_ADDRESS
const home_erc677 = process.env.HOME_ERC677
const zeroAddress = "0x0000000000000000000000000000000000000000"

log(`foreign_erc20 ${foreign_erc20} home_erc677 ${home_erc677}`)

async function deployDUFactories(){
    log(`Deploying template DU home contract from ${wallet_home.address}`)
    let deployer = new ContractFactory(DataUnionSidechain.abi, DataUnionSidechain.bytecode, wallet_home)
    let dtx = await deployer.deploy({ gasLimit: 6000000 })
    let duhome = await dtx.deployed()
    console.log(`duhome template: ${duhome.address}`)

    log(`Deploying template DU mainnet contract from ${wallet_foreign.address}`)
    deployer = new ContractFactory(DataUnionMainnet.abi, DataUnionMainnet.bytecode, wallet_foreign)
    dtx = await deployer.deploy({ gasLimit: 6000000 })
    let duforeign = await dtx.deployed()
    console.log(`duforeign template: ${duforeign.address}`)

    log(`Deploying MainnetMigrationManager contract from ${wallet_foreign.address}`)
    deployer = new ContractFactory(MainnetMigrationManager.abi, MainnetMigrationManager.bytecode, wallet_foreign)
    dtx = await deployer.deploy(foreign_erc20, foreign_erc_mediator, { gasLimit: 6000000 })
    let mainnetMigrationMgr = await dtx.deployed()
    console.log(`MainnetMigrationManager template: ${mainnetMigrationMgr.address}`)

    log(`Deploying SidechainMigrationManager contract from ${wallet_foreign.address}`)
    deployer = new ContractFactory(SidechainMigrationManager.abi, SidechainMigrationManager.bytecode, wallet_home)
    dtx = await deployer.deploy(home_erc677, zeroAddress, home_erc_mediator, { gasLimit: 6000000 })
    let sidechainMigrationMgr = await dtx.deployed()
    console.log(`SidechainMigrationManager template: ${sidechainMigrationMgr.address}`)

    // constructor( address _token_mediator, address _data_union_sidechain_template) public {
    log(`Deploying sidechain DU factory contract from ${wallet_home.address}`)
    deployer = new ContractFactory(DataUnionFactorySidechain.abi, DataUnionFactorySidechain.bytecode, wallet_home)
    dtx = await deployer.deploy(sidechainMigrationMgr.address, duhome.address, { gasLimit: 6000000 })
    let factSidechain = await dtx.deployed()
    console.log(`factorySidechain: ${factSidechain.address}`)

    /*
    ( address _token_mediator, 
                address _data_union_mainnet_template,
                address _data_union_sidechain_template,
                address _data_union_sidechain_factory,
                uint256 _sidechain_maxgas)
    */
    // constructor( address _token_mediator, address _data_union_sidechain_template) public {
    log(`Deploying DU mainnet factory contract from ${wallet_foreign.address}`)
    deployer = new ContractFactory(DataUnionFactoryMainnet.abi, DataUnionFactoryMainnet.bytecode, wallet_foreign)
    dtx = await deployer.deploy(mainnetMigrationMgr.address, duforeign.address, duhome.address, factSidechain.address, 2000000, { gasLimit: 6000000 })
    let factMainnet = await dtx.deployed()
    console.log(`factMainnet: ${factMainnet.address}`)

    fs.writeFileSync("du-addresses.json", JSON.stringify({
        mainnet: {
            dataUnionFactory: factMainnet.address,
            dataUnionTemplate: duforeign.address,
            tokenMigrator: mainnetMigrationMgr.address,

            // env variables that are set in deploy_bridge_and_du2.sh
            tokenMediator: process.env.FOREIGN_ERC677_MEDIATOR,
            amb: process.env.FOREIGN_AMB_BRIDGE,
            omnibridge: process.env.FOREIGN_OMNIBRIDGE,
        },
        xdai: {
            dataUnionFactory: factSidechain.address,
            dataUnionTemplate: duhome.address,
            tokenMigrator: sidechainMigrationMgr.address,

            // env variables that are set in deploy_bridge_and_du2.sh
            token: process.env.HOME_ERC677,
            tokenMediator: process.env.HOME_ERC677_MEDIATOR,
            amb: process.env.HOME_AMB_BRIDGE,
            omnibridge: process.env.HOME_OMNIBRIDGE,
        }
    }))
}

async function start() {
    try {
        await deployDUFactories() 
    }
    catch (err) {
        console.error(err)
    }
}
start()

