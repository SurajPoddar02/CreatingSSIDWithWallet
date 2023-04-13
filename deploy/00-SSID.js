const {network} = require("hardhat");
const {developmentChains} = require("../helper_hardhat_config")
const {verify} = require("../utils/verify")
const { ethers} = require("hardhat");
module.exports = async function ({getNamedAccounts, deployments}) {
    const {deploy, log} = deployments;
    const {deployer}   = await getNamedAccounts();
    log("--------------------------------")
    const args = [];
    console.log(await ethers.getSigners()[0]);
    const ssidWithWallet = await deploy ("SSIDWithWallet", { 
        from : deployer,
        args : args,
        log: true,
        waitConfirmations : network.config.blockConfirmations || 1,
        
    })
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(ssidWithWallet.address, args)
    }
}

module.exports.tags = ["all", "ssid", "main"]