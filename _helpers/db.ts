import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";
import accountModel from "../accounts/account.model";
import refreshTokenModel from "../accounts/refresh-token.model";
import dotenv from "dotenv";

dotenv.config();

const db: any = {};
export default db;

initialize();

async function initialize() {
  const host = process.env.DB_HOST!;
  const port = Number(process.env.DB_PORT);
  const user = process.env.DB_USER!;
  const password = process.env.DB_PASSWORD!;
  const database = process.env.DB_NAME!;

  // 🔥 STEP 1: TEST RAW CONNECTION (must be SSL-safe)
    const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    connectTimeout: 30000,
    ssl: {
        rejectUnauthorized: false
    }
    });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

  // 🔥 STEP 2: SEQUELIZE (FIXED FOR AIVEN)
  const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 30000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

  try {
    await sequelize.authenticate();
    console.log("✅ Aiven DB connected successfully");
  } catch (error) {
    console.error("❌ Sequelize connection failed:", error);
    throw error;
  }

  // Models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  db.Account.hasMany(db.RefreshToken, { onDelete: "CASCADE" });
  db.RefreshToken.belongsTo(db.Account);

  await sequelize.sync();
}