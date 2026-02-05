const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/product");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/products", productRoutes);

app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/index.html`);

    const { default: open } = await import("open");
    await open(`http://localhost:${PORT}/index.html`);
});
