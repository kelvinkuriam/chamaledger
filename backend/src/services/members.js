const pool = require('../../db');


const { appError } = require('../errors');

async function listMembers(){

const result = await pool.query('SELECT id ,name,phone,created_at FROM members ORDER BY id');

return result.rows

}
async function createMembers(data){
    const result = await pool.query(
        'INSERT INTO members(name,phone) VALUES($1,$2)' + 'RETURNIING id,name,phone,created_at', [data.name,data.phone]
    );

    return result.rows[0]
}


module.exports = { listMembers, createMembers}

