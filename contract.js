require("dotenv").config();
const { ethers } = require("ethers");

// Provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Wallet
const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

// Contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// ABI
const contractABI = [
  "function addProduct(string code, string hash)",
  "function getProduct(string code) view returns (string)"
];

// Contract instance
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet
);

module.exports = { contract };
