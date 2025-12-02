import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("Deploying Voting contract...");

  // Define initial proposals
  const proposals = [
    "Proposal A: Increase Community Fund",
    "Proposal B: Implement New Feature",
    "Proposal C: Change Governance Rules"
  ];

  // Deploy the contract
  const VotingFactory = await ethers.getContractFactory("Voting");
  const voting = await VotingFactory.deploy(proposals);

  await voting.waitForDeployment();

  const address = await voting.getAddress();
  const owner = await voting.owner();
  
  console.log(`✅ Voting contract deployed to: ${address}`);
  console.log(`📋 Proposals initialized:`);
  
  for (let i = 0; i < proposals.length; i++) {
    const proposal = await voting.getProposal(i);
    console.log(`   ${i}: ${proposal.name} (${proposal.voteCount} votes)`);
  }

  console.log(`👤 Contract owner: ${owner}`);

  // Save deployment info to a file for frontend
  const deploymentInfo = {
    address,
    owner,
    proposals,
    network: "localhost",
    chainId: 1337
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Also copy to frontend public folder
  fs.mkdirSync("./frontend/public", { recursive: true });
  fs.writeFileSync(
    "./frontend/public/deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📄 Deployment info saved to deployment.json and frontend/public/deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

