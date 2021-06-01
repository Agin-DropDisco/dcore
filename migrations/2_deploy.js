const DexSwap = artifacts.require('DexSwap');
const DEXswapDeployer = artifacts.require('DEXswapDeployer');
const DEXswapFactory = artifacts.require('DEXswapFactory');
const DexsAlpha = artifacts.require('DEXTOKEN');
const DexsBeta = artifacts.require('DEXTOKEN');
const DexsDelta = artifacts.require('DEXTOKEN');
const argValue = (arg, defaultValue) => process.argv.includes(arg) ? process.argv[process.argv.indexOf(arg) + 1] : defaultValue
const network = () => argValue('--network', 'local')

const DEXSWAP_WETH_ON_RINKEBY = "0xc778417E063141139Fce010982780140Aa0cD5Ab"; //WETH RINKEBY
const DEXSWAP_WETH_ON_MATIC = "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa";//WETH MATIC // MUMBAI
// const DEXSWAP_WETH_ON_MOONBEAM = "0xe73763DB808ecCDC0E36bC8E32510ED126910394"; //WETH RINKEBY

const MprotocolFeeReceiver = "0xAa961870f5ef113eeb3D02F9E1260671BFc19210";
const DEXSWAP_ROUTER_ON_MATIC = "0x6c6C8F8Bc6126894a6866BeAd6e43009139F38b6";
const DEXSWAP_FACTORY_ON_MATIC = "0xE8044F716BdF57f48EC0660b5C4ad9049bA0a412";
// 
// const DEXSWAP_WETH_ON_RINKEBY = "0xc778417E063141139Fce010982780140Aa0cD5Ab"; //WETH RINKEBY
const RprotocolFeeReceiver = "0xcD7cbff02Ee3A4C9fCa459283c1509eEf3110d1D";
const DEXSWAP_ROUTER_ON_RINKEBY = "0xFaBeb1f43B0d51a5e09908d29C7689B2AC1947F2";
const DEXSWAP_FACTORY_ON_RINKEBY = "0x33E4363D303D119624B0399D59b2dE06CC2B8728";
// 
module.exports = async (deployer) => {
    const BN = web3.utils.toBN
    const bnWithDecimals = (number, decimals) => BN(number).mul(BN(10).pow(BN(decimals)))
    const senderAccount = (await web3.eth.getAccounts())[0]

    if (network() === 'rinkeby') {
        // const FIFTY_PERCENT = bnWithDecimals(5, 9)
        const dexMint = await deployer.deploy(DexSwap, bnWithDecimals(1000000, 18))
        const dexVesting = await deployer.deploy(DexSwap, bnWithDecimals(1000000, 18))

        // TOKEN DEXALPHA
        console.log(`:: Start Deploying DexAlpha ::`);
        const DexAlpha = await deployer.deploy(DexsAlpha, "DexAlpha", "DexAlpha");
        // TOKEN DEXBETA
        console.log(`:: Start Deploying DexBeta ::`);
        const DexBeta = await deployer.deploy(DexsBeta, "DexBeta", "DexBeta");
        // TOKEN DEXDELTA
        console.log(`:: Start Deploying DexDelta ::`);
        const DexDelta = await deployer.deploy(DexsDelta, "DexDelta", "DexDelta");


        console.log(`---------------------------------------------------------------------------`);
        console.log(`:: Dex Alpha Token Address :   ${DexAlpha.address}`);
        console.log(`---------------------------------------------------------------------------`);
     
        console.log(`---------------------------------------------------------------------------`);
        console.log(`:: Dex Beta Token Address :    ${DexBeta.address}`);
        console.log(`---------------------------------------------------------------------------`);
     
        console.log(`---------------------------------------------------------------------------`);
        console.log(`:: Dex Delta Token Address :   ${DexDelta.address}`);
        console.log(`---------------------------------------------------------------------------`);


        const dexSwapDeployer = await deployer.deploy(DEXswapDeployer, RprotocolFeeReceiver, senderAccount, DEXSWAP_WETH_ON_RINKEBY, [dexMint.address], [dexVesting.address], [15])
        await dexSwapDeployer.send(1, {from: senderAccount})
        console.log("Sent deployment reimbursement")
        console.log();
        await dexSwapDeployer.deploy({from: senderAccount})
        console.log("Deployed DexSwap")
        console.log();

        const dexSwapFactory =  await DEXswapFactory.at(DEXSWAP_FACTORY_ON_RINKEBY, senderAccount, DEXSWAP_WETH_ON_RINKEBY); // DEXSWAP FACTORY ADDRESS
        // 
        console.log(`:: Start Validating`);
        console.log();

        //Approve router on tokens
        console.log(`:: Validate Router to Dex Alpha`);
        console.log(`---------------------------------------------------------------------------`);
        await DexAlpha.approve(DEXSWAP_ROUTER_ON_RINKEBY, '100000000000000000000000');
        // 
        console.log(`:: Validate Router to Dex Beta`);
        console.log(`---------------------------------------------------------------------------`);
        await DexBeta.approve(DEXSWAP_ROUTER_ON_RINKEBY,  '100000000000000000000000');
        // 
        console.log(`:: Validate Router to Dex Delta`);
        console.log(`---------------------------------------------------------------------------`);
        await DexDelta.approve(DEXSWAP_ROUTER_ON_RINKEBY, '100000000000000000000000');
        //Create Pair with Factory and Get Address

        await dexSwapFactory.createPair(DexAlpha.address, DexBeta.address);

        await dexSwapFactory.createPair(DexBeta.address,  DexDelta.address);
        
        await dexSwapFactory.createPair(DexDelta.address, DexAlpha.address);
        // 
        await dexSwapFactory.createPair(DexAlpha.address, DEXSWAP_WETH_ON_RINKEBY);

        await dexSwapFactory.createPair(DexBeta.address,  DEXSWAP_WETH_ON_RINKEBY);
        
        await dexSwapFactory.createPair(DexDelta.address, DEXSWAP_WETH_ON_RINKEBY);
        
        
        const dexLP1 = await dexSwapFactory.getPair(DexAlpha.address, DexBeta.address);
              
        const dexLP2 = await dexSwapFactory.getPair(DexBeta.address, DexDelta.address);
              
        const dexLP3 = await dexSwapFactory.getPair(DexDelta.address, DexAlpha.address);
        // 
        const dexLP4 = await dexSwapFactory.getPair(DexAlpha.address, DEXSWAP_WETH_ON_RINKEBY);
              
        const dexLP5 = await dexSwapFactory.getPair(DexBeta.address,  DEXSWAP_WETH_ON_RINKEBY);
              
        const dexLP6 = await dexSwapFactory.getPair(DexDelta.address, DEXSWAP_WETH_ON_RINKEBY);
        
        
        console.log(`---------------------------------------------------------------------------`);
        
        console.log(`Liquidity 1st: ${dexLP1}`);
        console.log(`---------------------------------------------------------------------------`);
              
        console.log(`Liquidity 2nd: ${dexLP2}`);
        console.log(`---------------------------------------------------------------------------`);
              
        console.log(`Liquidity 3rd: ${dexLP3}`);
        console.log(`---------------------------------------------------------------------------`);

        console.log(`Liquidity 1st: ${dexLP4}`);
        console.log(`---------------------------------------------------------------------------`);
              
        console.log(`Liquidity 2nd: ${dexLP5}`);
        console.log(`---------------------------------------------------------------------------`);
              
        console.log(`Liquidity 3rd: ${dexLP6}`);
        console.log(`---------------------------------------------------------------------------`);

        
        console.log("Pair init code hash: ", await dexSwapFactory.INIT_CODE_PAIR_HASH())

    }
}
