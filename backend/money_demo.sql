CREATE TABLE money_demo(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    amount_cents BIGINT NOT NULL CHECK(amount_cents > 0)
);

INSERT INTO money_demo(amount_cents) 
VALUES (-500), (NULL);

SELECT SUM(amount_cents) AS total_cents FROM money_demo;

DROP TABLE money_demo;