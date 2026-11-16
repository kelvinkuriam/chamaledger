const pool = require("../../db");

const { appError } = require("../errors");


const COLUMNS  = 'id,member_id,type,direction,amount_cents,reverses_entry_id,' + 'note,entry_date,created_at'


async function createEntry(data){
  if(data.type === 'REVERSAL'){
    return createReversal(data)
  }

const member = await pool.query(
  
'SELECT id FROM members WHERE id = $1',
[data.member_id]



);

if (member.rowCount === 0){
  throw appError(400,'MEMBER_NOT_FOUND',`No member with id ${data.member_id} was found.`);
}

const direction = data.type === 'PAYOUT' ? 'OUT' : 'IN';

const result =  await pool.query(
"INSERT INTO ledger_entries" +

"(member_id,type,direction,amount_cents,entry_date,note)" +
'VALUES ($1,$2,$3,$4,$5,$6) RETURNING ' + COLUMNS,
[data.member_id,
  data.type,
  direction,
  data.amount_cents,
  data.entry_date,
  data.note ?? null]
)

return result.rows[0];
}


async function createReversal(data){

const original = await pool.query(
  'SELECT' + COLUMNS + ' FROM ledger_entries WHERE id = $1',
  [data.reverses_entry_id]
);

if(original.rowCount === 0){
  throw appError(
    404,
    'ENTRY_NOT_FOUND',
    `No entry with id ${data.reverses_entry_id} was found.`
  )
}

 const originalEntry = original.rows[0];
 
 if(originalEntry.type === 'REVERSAL'){
  throw appError(
    400,
    'INVALID_REVERSAL',
    `Entry with id ${data.reverses_entry_id} is a reversal and cannot be reversed.`
  )
 }


 const already = await pool.query(
'SELECT 1 FROM ledger_entries WHERE reverses_entry_id = $1',
[originalEntry.id])

if(already.rowCount > 0){
  throw appError(
    400,
    'ALREADY_REVERSED',
    `Entry with id ${data.reverses_entry_id} has already been reversed.`
  )
}

const direction = originalEntry.direction === 'IN' ? 'OUT':'IN';

const result = await pool.query(

  "INSERT INTO ledger_entries" + "(member_id,type,direction,amount_cents,reverses_entry_id,entry_date,note)" +
  "VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING " + COLUMNS,

  [
    originalEntry.member_id,
    direction,
    originalEntry.amount_cents,
    originalEntry.id,
    data.entry_date,
    data.note ?? null
  ]
)
return result.rows[0];

}


module.exports = { createEntry }






