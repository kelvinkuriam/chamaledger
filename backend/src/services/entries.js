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


async function listEntries(q){
const conditions = [];

const params = [];


if(q.member_id !== undefined){
  params.push(q.member_id);
  conditions.push(`member_id = $${params.length}`)};


  if(q.type !== undefined){
    params.push(q.type);
    conditions.push(`type = $${params.length}`);
  }

  if(q.from !== undefined){
    params.push(q.from);
    conditions.push(`entry_date >= $${params.length}`);
  }

  if(q.to !== undefined){
    params.push(q.to);
    conditions.push(`entry_date <= $${params.length}`);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';


const counted = await pool.query(
  `SELECT COUNT(*) AS total FROM ledger_entries ${where}`,
  params
);

const total =counted.rows[0].total;

const offset = (q.page - 1) * q.page_size;

const rows = await pool.query(
  `SELECT ${COLUMNS} FROM ledger_entries ${where} ORDER BY entry_date DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,params.concat([q.page_size,offset])
)


return {
  data:rows.rows,
  page:q.page,
  page_size:q.page_size,
  total:total,
  total_pages:Math.ceil(total / q.page_size)
}



}






module.exports = { createEntry, listEntries }






