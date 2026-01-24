export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'approval_system',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },
  wechat: {
    appId: process.env.appid,
    secret: process.env.secret,
  },
});
