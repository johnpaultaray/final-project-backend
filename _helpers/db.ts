import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";
import accountModel from "../accounts/account.model";
import refreshTokenModel from "../accounts/refresh-token.model";
import bcrypt from "bcryptjs";
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

  // 🔥 STEP 1: TEST RAW CONNECTION (Aiven requires SSL)
  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl: {
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
  } catch (err) {
    console.error("❌ MySQL raw connection failed:", err);
    throw err;
  }

  // 🔥 STEP 2: SEQUELIZE CONNECTION (Aiven safe config)
  const sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: "mysql",
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  try {
    await sequelize.authenticate();
    console.log("✅ Aiven DB connected successfully");
  } catch (error) {
    console.error("❌ Sequelize connection failed:", error);
    throw error;
  }

  // 🔥 MODELS
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  db.Account.hasMany(db.RefreshToken, { onDelete: "CASCADE" });
  db.RefreshToken.belongsTo(db.Account);

  await sequelize.sync();

  // 🔥 STEP 3: SEED CURRENT ETHEREAL ADMIN USER
  await seedAdminAccount();
}

async function seedAdminAccount() {
  try {
    // Updated to match your new config.json Ethereal user account
    const adminEmail = "calista.hane70@ethereal.email";
    
    const accountExists = await db.Account.findOne({ where: { email: adminEmail } });
    
    if (!accountExists) {
      const defaultPasswordHash = await bcrypt.hash("AdminPass123!", 10);
      
      await db.Account.create({
        title: "Mr.",
        firstName: "John",
        lastName: "Paul",
        email: adminEmail,
        passwordHash: defaultPasswordHash,
        acceptTerms: true,
        role: "Admin", 
        verified: new Date(), // Pre-verified for instant bypass
      });
      
      console.log(`🌱 Seeded default Ethereal testing account: ${adminEmail}`);
    }
  } catch (seedError) {
    console.error("⚠️ Database admin seeding skipped or failed:", seedError);
  }
}