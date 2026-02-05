const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { pool, poolConnect } = require("../db");
const { contract } = require("../contract");


// =====================================================
// 1️⃣ REGISTER
// =====================================================
router.post("/register", async (req, res) => {
    try {
        await poolConnect;

        const { company, email, password } = req.body;

        const check = await pool.request()
            .input("email", email)
            .query("SELECT * FROM Users WHERE Email = @email");

        if (check.recordset.length > 0) {
            return res.json({ status: "EMAIL_EXISTS" });
        }

        await pool.request()
            .input("company", company)
            .input("email", email)
            .input("password", password)
            .query(`
                INSERT INTO Users (CompanyName, Email, Password)
                VALUES (@company, @email, @password)
            `);

        res.json({ status: "REGISTERED" });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ error: "Register error" });
    }
});


// =====================================================
// 2️⃣ LOGIN
// =====================================================
router.post("/login", async (req, res) => {
    try {
        await poolConnect;

        const { email, password } = req.body;

        const result = await pool.request()
            .input("email", email)
            .input("password", password)
            .query(`
                SELECT * FROM Users
                WHERE Email = @email AND Password = @password
            `);

        if (result.recordset.length === 0) {
            return res.json({ status: "FAILED" });
        }

        res.json({
            status: "SUCCESS",
            userId: result.recordset[0].UserID
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Login error" });
    }
});


// =====================================================
// 3️⃣ CREATE PRODUCT
// =====================================================
router.post("/create", async (req, res) => {
    try {
        await poolConnect;

        const { userId, code, name, origin, date } = req.body;

        if (!userId || !code || !name || !origin || !date) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // 🔥 Format date chuẩn để hash không lệch
        const formattedDate = new Date(date).toISOString().split("T")[0];

        // 🔥 Tạo hash chuẩn
        const rawData = name + origin + formattedDate;
        const hash = crypto
            .createHash("sha256")
            .update(rawData)
            .digest("hex");

        console.log("CREATE DATA:", rawData);
        console.log("CREATE HASH:", hash);

        // 🔥 Ghi blockchain
        const tx = await contract.addProduct(code, hash);
        await tx.wait();

        // 🔥 Lưu SQL
        await pool.request()
            .input("code", code)
            .input("name", name)
            .input("origin", origin)
            .input("date", formattedDate)
            .input("hash", hash)
            .input("userId", userId)
            .query(`
                INSERT INTO Products
                (ProductCode, ProductName, Origin, ManufactureDate, BlockchainHash, UserID)
                VALUES (@code, @name, @origin, @date, @hash, @userId)
            `);

        res.json({ status: "CREATED", hash });

    } catch (err) {
        console.error("Create product error:", err);
        res.status(500).json({ error: "Create error" });
    }
});


// =====================================================
// 4️⃣ VERIFY PRODUCT
// =====================================================
router.get("/verify/:code", async (req, res) => {
    try {
        await poolConnect;

        const code = req.params.code;

        const result = await pool.request()
            .input("code", code)
            .query(`
                SELECT p.*, u.CompanyName
                FROM Products p
                JOIN Users u ON p.UserID = u.UserID
                WHERE p.ProductCode = @code
            `);

        if (result.recordset.length === 0) {
            return res.json({ status: "NOT_FOUND" });
        }

        const product = result.recordset[0];

        // 🔥 Format ngày giống lúc CREATE
        const formattedDate = new Date(product.ManufactureDate)
            .toISOString()
            .split("T")[0];

        // 🔥 TÍNH LẠI HASH từ dữ liệu hiện tại trong SQL
        const recalculatedHash = crypto
            .createHash("sha256")
            .update(product.ProductName + product.Origin + formattedDate)
            .digest("hex")
            .trim()
            .toLowerCase();

        // 🔥 LẤY HASH GỐC TỪ BLOCKCHAIN
        let blockchainHash = await contract.getProduct(code);
        blockchainHash = blockchainHash.toString().trim().toLowerCase();

        console.log("RECALCULATED HASH:", recalculatedHash);
        console.log("BLOCKCHAIN HASH:", blockchainHash);

        // 🔥 SO SÁNH HASH
        if (blockchainHash === recalculatedHash) {
            return res.json({
                status: "VALID",
                product
            });
        } else {
            return res.json({
                status: "TAMPERED"
            });
        }

    } catch (err) {
        console.error("Verify error:", err);
        res.status(500).json({ error: "Verify error" });
    }
});



// 🔥 QUAN TRỌNG NHẤT
module.exports = router;
