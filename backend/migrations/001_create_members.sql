CREATE TABLE members(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(trim(name)) >0),
    phone TEXT NOT NULL CHECK (length(trim(phone))>0)
);
