const { Pool ,types} = require('pg');

types.setTypeParser(20, val => parseInt(val))

types.setTypeParser(1082, val => val)

const pool = new Pool({connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis:5000,
    idleTimeoutMillis:10000,
});

pool.on('error',(err)=>{
    console.error('Unexpected error on idle client', err.message)   
})

module.exports = pool;