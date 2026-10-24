DROP TABLE IF EXISTS members;

CREATE TABLE members(
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
name  VARCHAR(25) NOT NULL,
phone VARCHAR(15) NOT NULL
);


INSERT INTO members(name,phone) VALUES
('John Doe','123-456-7890'),
('Jane Smith','987-654-3210'),
('Alice Johnson','555-123-4567'),
('Bob Brown','111-222-3333'),
('Charlie Davis','444-555-6666');


SELECT *  FROM  members;