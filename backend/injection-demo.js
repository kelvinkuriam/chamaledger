const pool = require('./db'); // Assuming you have a db.js file that exports your database connection

async function main(){
    const input = " ' OR '1' = '1";

    const unsafe = await pool.query(
        "SELECT name FROM members WHERE phone = '" + input + "'")
        console.log('unsafe:', unsafe.rowCount,'rows');

    const safe = await pool.query(
        'SELECT name FROM members WHERE phone = $1',[input]
    )
    console.log('safe:', safe.rowCount,'rows');
    await pool.end();

}

main();