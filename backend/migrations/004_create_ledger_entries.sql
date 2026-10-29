CREATE TABLE ledger_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- REFERENCES members (id) makes member_id a FOREIGN KEY: the database
  -- refuses a value that is not the id of an existing member, so an entry
  -- can never point at a member who does not exist.
  member_id BIGINT NOT NULL REFERENCES members (id),

  -- type is the kind of entry. IN ('A', 'B', ...) means "must be one of
  -- these exact values", so a typo such as 'CONTRIBUTON' is refused.
  type TEXT NOT NULL
    CHECK (type IN ('CONTRIBUTION', 'PAYOUT', 'FINE', 'REVERSAL')),

  -- direction says whether the entry puts money INTO the group pot or takes
  -- it OUT. Storing it lets the balance be one SUM with no lookups.
  direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT')),

  -- Whole cents above zero (Concept 6). The sign comes from direction.
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),

  -- For a REVERSAL, the id of the entry being undone. It points at another
  -- row of this same table, so it is a foreign key too. It is empty (NULL)
  -- for every other type.
  reverses_entry_id BIGINT REFERENCES ledger_entries (id),

  note       TEXT,
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A CHECK written after the columns can look at several columns at once.
  -- Contributions and fines must go IN, a payout must go OUT, and a
  -- reversal may go either way because it undoes whatever it points at.
  CHECK (
    (type IN ('CONTRIBUTION', 'FINE') AND direction = 'IN')
    OR (type = 'PAYOUT' AND direction = 'OUT')
    OR type = 'REVERSAL'
  ),

  -- A reversal must name the entry it undoes, and nothing else may.
  -- (A = B) compares two true/false answers: both true or both false.
  CHECK ((type = 'REVERSAL') = (reverses_entry_id IS NOT NULL))
);