import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    profiles: {
      default: {
        version: "0.8.19",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "paris",
        },
      },
      production: {
        version: "0.8.19",
        settings: {
          optimizer: { enabled: true, runs: 1_000 },
          evmVersion: "paris",
        },
      },
    },
  },
  networks: {
    whitechainSepolia: {
      type: "http",
      chainType: "generic",
      chainId: 1874,
      url: process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io",
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
    whitechainSigner1: {
      type: "http",
      chainType: "generic",
      chainId: 1874,
      url: process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io",
      accounts: [configVariable("SOVA_SIGNER_1_PRIVATE_KEY")],
    },
    whitechainSigner2: {
      type: "http",
      chainType: "generic",
      chainId: 1874,
      url: process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io",
      accounts: [configVariable("SOVA_SIGNER_2_PRIVATE_KEY")],
    },
    whitechainIssuer: {
      type: "http",
      chainType: "generic",
      chainId: 1874,
      url: process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io",
      accounts: [configVariable("SOVA_ISSUER_PRIVATE_KEY")],
    },
  },
  test: {
    mocha: {
      timeout: 20_000,
    },
  },
});
