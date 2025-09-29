import pkg from "pg";
const { Client } = pkg;


// Konfigurasi koneksi PostgreSQL
const client = new Client({
    host: "localhost", // atau IP server
    port: 5432, // default PostgreSQL port
    user: "postgres", // username kamu
    password: "postgres123", // ganti dengan password PostgreSQL
    database: "cv_evaluator" // nama database
});

// Coba koneksi ke database
client.connect()
    .then(() => {
        console.log("✅ Terhubung ke PostgreSQL!");
    })
    .catch(err => {
        console.error(err.message);
    });