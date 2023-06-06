BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "transactions" (
	"transaction_id"	INTEGER NOT NULL UNIQUE,
	"confirmation_number"	INTEGER NOT NULL,
	"isbn"	INTEGER NOT NULL,
	"user_id"	INTEGER,
	"date"	DATETIME NOT NULL,
	"quantity_purchased"	INTEGER NOT NULL,
	PRIMARY KEY("transaction_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "users" (
	"user_id"	INTEGER NOT NULL UNIQUE,
	"username"	TEXT,
	"password"	TEXT NOT NULL,
	"email"	TEXT NOT NULL,
	FOREIGN KEY("user_id") REFERENCES "transactions"("user_id"),
	PRIMARY KEY("user_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "cart" (
	"user_id"	INTEGER NOT NULL,
	"isbn"	TEXT NOT NULL UNIQUE,
	"quantity"	INTEGER NOT NULL,
	FOREIGN KEY("user_id") REFERENCES "users"("user_id"),
	PRIMARY KEY("isbn")
);
CREATE TABLE IF NOT EXISTS "items" (
	"name"	TEXT NOT NULL,
	"subject"	TEXT NOT NULL,
	"pages"	INTEGER NOT NULL,
	"isbn"	TEXT NOT NULL UNIQUE,
	"description"	TEXT,
	"author"	REAL NOT NULL,
	"price"	INTEGER NOT NULL,
	"amount_in_stock"	INTEGER NOT NULL,
	PRIMARY KEY("isbn")
);
COMMIT;
