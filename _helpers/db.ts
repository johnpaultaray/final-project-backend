import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';
const db: any = {};
export default db;
initialize();
async function initialize() {
    const { host, port, user, password, database, ssl }: DatabaseConfig = config.database;

    // Establish a connection to MySQL with SSL support
    const connection = await mysql.createConnection({ 
        host, 
        port, 
        user, 
        password, 
        ssl: ssl ? { rejectUnauthorized: false } : undefined 
    });

    // Create DB if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \
\`${database}\`;`);

    // Connect to DB using Sequelize with SSL support
    const sequelize = new Sequelize(database, user, password, { 
        dialect: 'mysql',
        host: host,
        port: port,
        dialectOptions: ssl ? { ssl: { rejectUnauthorized: false } } : undefined
    });

    // Init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Sync models with database
    await sequelize.sync();
}

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}
