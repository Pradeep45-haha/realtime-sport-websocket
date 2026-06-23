import { Pool } from 'pg'
 
const pool = new Pool({
  host: 'localhost',
  user: 'database-user',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});


pool.connect();


pool.on('connect',(client)=>{
    console.log("client connected to DB");
})

pool.on('error',(err)=>{
console.log(`error while connecting to DB ${err.message}`);
});