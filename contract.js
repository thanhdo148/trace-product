require("dotenv").config();
const { ethers } = require("ethers");

// ==============================
// 1️⃣ PROVIDER (Sepolia RPC)
// ==============================
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// ==============================
// 2️⃣ WALLET (Private key)
// ==============================
const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

// ==============================
// 3️⃣ CONTRACT ADDRESS
// ==============================
const contractAddress = process.env.CONTRACT_ADDRESS;

// ==============================
// 4️⃣ ABI (FULL PRODUCT VERSION)
// ==============================
const contractABI = [
  "function addProduct(string _code,string _name,string _origin,string _manufactureDate,string _company)",
  "function getProduct(string _code) view returns (string name,string origin,string manufactureDate,string company,bool exists)"
];

// ==============================
// 5️⃣ CONTRACT INSTANCE
// ==============================
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet
);

module.exports = { contract };
