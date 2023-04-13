const { assert, expect } = require("chai");
const { network, deployments ,ethers} = require("hardhat");
const { developmentChains } = require("../../helper_hardhat_config");
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SSIDWithWallet", function () {
  let ssidWithWallet;
  let wallet;

  before(async function () {
    await deployments.fixture(["ssid"]);
    console.log(await ethers.getSigners()[0].getAddress);
    ssidWithWallet = await ethers.getContractAt("SSIDWithWallet",await ethers.getSigners()[0].getAddress);
    wallet = await ethers.getContractAt("Wallet", await ssidWithWallet.identities(await ethers.getSigners()[0].getAddress()).wallet);
  });

  it("should create identity", async function () {
    await ssidWithWallet.createIdentity("Alice", "alice@example.com", 20000101);
    const identity = await ssidWithWallet.getIdentity(await ssidWithWallet.identities(await ethers.getSigners()[0].getAddress()).id);
    assert.equal(identity.name, "Alice");
    assert.equal(identity.email, "alice@example.com");
    assert.equal(identity.dob, 20000101);
    assert.notEqual(identity.wallet, null);
  });

  it("should issue certification", async function () {
    const identity = await ssidWithWallet.identities(await ethers.getSigners()[0].getAddress());
    const certificationName = "Certification 1";
    const issueDate = 20220101;
    const verified = true;
    await ssidWithWallet.issueCertification(identity.id, certificationName, issueDate, verified);
    const certificationID = identity.certificationIDs[0];
    const certification = await ssidWithWallet.certifications(certificationID);
    assert.equal(certification.name, certificationName);
    assert.equal(certification.issueDate, issueDate);
    assert.equal(certification.verified, verified);
  });

  it("should verify certification", async function () {
    const identity = await ssidWithWallet.identities(await ethers.getSigners()[0].getAddress());
    const certificationID = identity.certificationIDs[0];
    const verified = await ssidWithWallet.verifyCertification(certificationID);
    assert.equal(verified, true);
  });

  it("should transfer tokens using wallet", async function () {
    const ERC20 = await ethers.getContractFactory("ERC20");
    const token = await ERC20.deploy("Test Token", "TEST", 18, 1000);
    await token.transfer(wallet.address, 100);
    await wallet.transfer(await ethers.getSigners()[1].getAddress(), 50, token.address);
    const ownerBalance = await token.balanceOf(wallet.address);
    const recipientBalance = await token.balanceOf(await ethers.getSigners()[1].getAddress());
    assert.equal(ownerBalance, 50);
    assert.equal(recipientBalance, 50);
  });
});
