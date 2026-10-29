INSERT INTO ledger_entries (member_id, type, direction, amount_cents, entry_date, note) VALUES
  (1, 'CONTRIBUTION', 'IN',  500000, '2026-10-01', 'October contribution'),
  (2, 'CONTRIBUTION', 'IN',  500000, '2026-10-01', 'October contribution'),
  (2, 'CONTRIBUTION', 'IN',   50000, '2026-10-02', 'typed KES 500 instead of 5,000');

  INSERT INTO ledger_entries
  (member_id, type, direction, amount_cents, reverses_entry_id, entry_date, note)
VALUES
  (2, 'REVERSAL', 'OUT', 50000, 3, '2026-10-02', 'reverses entry 3');


  SELECT COALESCE(
         SUM(CASE direction WHEN 'IN' THEN amount_cents ELSE -amount_cents END),
         0) AS group_balance_cents
FROM ledger_entries;


-- MEMBER BALANCE: the same sum, limited to one member by WHERE.
SELECT COALESCE(
         SUM(CASE direction WHEN 'IN' THEN amount_cents ELSE -amount_cents END),
         0) AS member_balance_cents
FROM ledger_entries
WHERE member_id = 3;