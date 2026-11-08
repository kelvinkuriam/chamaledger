const pool = require('../../db')

const { appError} = require('../errors');


const COLUMNS = "id, member_id, type, direction, amount_cents, reverses_entry_id, " +
  "note, entry_date, created_at";

  async function createEntry(data){
    if (data.type === 'REVERSAL'){
        return createReversal(data)
    }
    // Handle other entry types


    const member = await pool.query('SELECT 1 FROM members WHERE id = $1', [data.member_id]);
    if (member.rowCount === 0){
        throw appError(400, 'MEMBER_NOT_FOUND', `Member with id ${data.member_id} does not exist`);
    }




const direction = data.type === 'CONTRIBUTION' ? 'IN' : 'OUT';

const result = await pool.query(
'INSERT INTO ledger_entries (member_id, type, direction, amount_cents, entry_date,note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING ' + COLUMNS, [
data.member_id,
data.type,
direction,
data.amount_cents,
data.entry_date,
data.note ?? null



]


)



return result.rows[0];









  }




  async function createReversal(data) {
  // Load the entry being undone.
  const found = await pool.query(
    "SELECT id, member_id, type, direction, amount_cents " +
      "FROM ledger_entries WHERE id = $1",
    [data.reverses_entry_id]
  );
  
  if (found.rowCount === 0) {
    throw appError(404, "ENTRY_NOT_FOUND", "No entry with id " + data.reverses_entry_id);
  }
  
  const original = found.rows[0];
  
  // RULE 3: A reversal cannot be reversed.
  // Allowing it would create chains that are hard to read.
  // To undo a reversal, add a fresh entry that looks like the original.
  if (original.type === "REVERSAL") {
    throw appError(409, "CANNOT_REVERSE_A_REVERSAL", 
      "Entry " + original.id + " is itself a reversal");
  }
  
  // RULE 4: An entry can be reversed only ONCE.
  // Look for an existing reversal that points at this entry.
  // 409 Conflict means "the request is valid, but it clashes with 
  // the current state of the data".
  const already = await pool.query(
    "SELECT 1 FROM ledger_entries WHERE reverses_entry_id = $1",
    [original.id]
  );
  
  if (already.rowCount > 0) {
    throw appError(409, "ALREADY_REVERSED", 
      "Entry " + original.id + " has already been reversed");
  }
  
  // The reversal goes the OPPOSITE way, for the same member and amount.
  // This is how the SUM in Concept 9 cancels the original exactly.
  const direction = original.direction === "IN" ? "OUT" : "IN";
  
  const result = await pool.query(
    "INSERT INTO ledger_entries " +
      "(member_id, type, direction, amount_cents, reverses_entry_id, entry_date, note) " +
      "VALUES ($1, 'REVERSAL', $2, $3, $4, $5, $6) RETURNING " + COLUMNS,
    [
      // CRITICAL: member and amount come from the ORIGINAL row, 
      // NEVER from the client. Even if the client sent them, 
      // the schema dropped them. This is how we guarantee a 
      // reversal can never land under the wrong member.
      original.member_id,
      direction,
      original.amount_cents,
      original.id,
      data.entry_date,
      data.note ?? null,
    ]
  );
  
  return result.rows[0];
}

module.exports = { createEntry };