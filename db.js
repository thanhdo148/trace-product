const sql = require("mssql");

const config = {
    user: "sa123",
    password: "123",
    server: "LAPTOP-LDFGOED4\\SQLEXPRESS",
    database: "TraceDB",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
    .then(() => console.log("✅ Connected to SQL - TraceDB"))
    .catch(err => console.log("❌ DB Connection Failed!", err));

module.exports = {
    sql,
    pool,
    poolConnect
};
