const express = require("express");
const router = express.Router();
const { contract } = require("../contract");


// CREATE PRODUCT (BLOCKCHAIN ONLY)
router.post("/create", async (req, res) => {
    try {

        const { code, name, origin, date, company } = req.body;

        if (!code || !name || !origin || !date || !company) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const tx = await contract.addProduct(
            code,
            name,
            origin,
            date,
            company
        );

        await tx.wait();

        res.json({
            status: "CREATED_ON_BLOCKCHAIN",
            transactionHash: tx.hash
        });

    } catch (err) {
        console.error("Create product error:", err);
        res.status(500).json({ error: err.message });
    }
});


// VERIFY PRODUCT (BLOCKCHAIN ONLY)
router.get("/verify/:code", async (req, res) => {
    try {

        const code = req.params.code;

        const product = await contract.getProduct(code);

        const [name, origin, manufactureDate, company, exists] = product;

        if (!exists) {
            return res.json({ status: "NOT_FOUND" });
        }

        res.json({
            status: "VALID",
            product: {
                code,
                name,
                origin,
                manufactureDate,
                company
            }
        });

    } catch (err) {
        console.error("Verify error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
