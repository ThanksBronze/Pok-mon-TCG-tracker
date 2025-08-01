CREATE OR REPLACE FUNCTION trigger_set_timestamp()
	RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(100) UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS roles (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS series (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS card_types (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	category VARCHAR(100),
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS sets (
	id SERIAL PRIMARY KEY,
	series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
	set_no INTEGER,
	symbol VARCHAR(50),
	logo VARCHAR(255),
	name_of_expansion VARCHAR(100) NOT NULL,
	type_of_expansion VARCHAR(100),
	no_of_cards INTEGER,
	release_date DATE,
	set_abb VARCHAR(10),
	notes TEXT,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS cards (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	type_id INTEGER NOT NULL REFERENCES card_types(id),
	set_id INTEGER NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
	no_in_set INTEGER NOT NULL,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	image_small TEXT,
	image_large TEXT,
	rarity VARCHAR(100),
	price_low NUMERIC,
	price_mid NUMERIC,
	price_high NUMERIC,
	price_market NUMERIC,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMP NULL,
	CONSTRAINT uq_cards_user_set_name UNIQUE (user_id, set_id, name)
);

ALTER TABLE cards
	ADD COLUMN IF NOT EXISTS document_with_weights tsvector;

UPDATE cards
SET document_with_weights =
		setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
		setweight(to_tsvector('english', coalesce(rarity, '')), 'B');

CREATE INDEX IF NOT EXISTS idx_cards_fts
	ON cards USING GIN(document_with_weights);

CREATE OR REPLACE FUNCTION trigger_update_document_with_weights()
	RETURNS TRIGGER AS $$
BEGIN
	NEW.document_with_weights :=
		setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
		setweight(to_tsvector('english', coalesce(NEW.rarity, '')), 'B');
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cards_document_weights ON cards;

CREATE TRIGGER update_cards_document_weights
	BEFORE INSERT OR UPDATE ON cards
	FOR EACH ROW
	EXECUTE FUNCTION trigger_update_document_with_weights();

UPDATE cards
SET document_with_weights =
		setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
		setweight(to_tsvector('english', coalesce(rarity, '')), 'B');

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_cards_name_trgm ON cards USING GIN (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS categories (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS card_categories (
	card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
	category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
	PRIMARY KEY (card_id, category_id)
);

CREATE TABLE IF NOT EXISTS notes (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
	content TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
	tbl text;
BEGIN
	FOR tbl IN SELECT unnest(
		ARRAY[
			'users','roles','user_roles','series','card_types','sets','cards','categories','card_categories','notes'
		]
	) LOOP
		EXECUTE format('DROP TRIGGER IF EXISTS set_timestamp ON %I;', tbl);
		EXECUTE format(
			'CREATE TRIGGER set_timestamp
				BEFORE UPDATE ON %I
				FOR EACH ROW
				EXECUTE FUNCTION trigger_set_timestamp();',
			tbl
		);
	END LOOP;
END;
$$ LANGUAGE plpgsql;


CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type_id);
CREATE INDEX IF NOT EXISTS idx_card_categories_category ON card_categories(category_id);

ALTER TABLE cards
	DROP CONSTRAINT IF EXISTS uq_cards_user_set_name;
CREATE UNIQUE INDEX IF NOT EXISTS uq_cards_user_set_name_active
	ON cards(user_id, set_id, name)
	WHERE deleted_at IS NULL;


/* INSERTED DATA*/

INSERT INTO series (name) VALUES ('Original Series');
INSERT INTO series (name) VALUES ('Neo Series');
INSERT INTO series (name) VALUES ('Legendary Collection Series');
INSERT INTO series (name) VALUES ('e-Card Series');
INSERT INTO series (name) VALUES ('EX Series');
INSERT INTO series (name) VALUES ('Diamond & Pearl Series');
INSERT INTO series (name) VALUES ('Platinum Series');
INSERT INTO series (name) VALUES ('HeartGold & SoulSilver Series');
INSERT INTO series (name) VALUES ('Call of Legends Series');
INSERT INTO series (name) VALUES ('Black & White Series');
INSERT INTO series (name) VALUES ('XY Series');
INSERT INTO series (name) VALUES ('Sun & Moon Series');
INSERT INTO series (name) VALUES ('Sword & Shield Series');
INSERT INTO series (name) VALUES ('Scarlet & Violet Series');


-- Original Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 1, NULL, NULL, 'Base Set', 'Main Series Expansion', 102, '1999-01-09', 'base1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 2, NULL, NULL, 'Jungle', 'Main Series Expansion', 64, '1999-06-16', 'base2');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 3, NULL, NULL, 'Fossil', 'Main Series Expansion', 62, '1999-10-10', 'base3');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 4, NULL, NULL, 'Base Set 2', 'Main Series Expansion', 130, '2000-02-24', 'base4');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (1, 5, NULL, NULL, 'Team Rocket', 'Main Series Expansion', 82, '2000-04-24', 'base5', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 6, NULL, NULL, 'Gym Heroes', 'Main Series Expansion', 132, '2000-08-14', 'gym1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 7, NULL, NULL, 'Gym Challenge', 'Main Series Expansion', 132, '2000-10-16', 'gym2');

-- Neo Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (2, 1, NULL, NULL, 'Neo Genesis', 'Main Series Expansion', 111, '2000-12-16', 'neo1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (2, 2, NULL, NULL, 'Neo Discovery', 'Main Series Expansion', 75, '2001-06-01', 'neo2');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (2, 4, NULL, NULL, 'Southern Islands', 'promotional set', 18, '2001-07-31', 'si1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (2, 3, NULL, NULL, 'Neo Revelation', 'Main Series Expansion', 64, '2001-09-21', 'neo3', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (2, 5, NULL, NULL, 'Neo Destiny', 'Main Series Expansion', 105, '2002-02-28', 'neo4', 'Includes 8 secret cards');


-- Legendary Collection Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (3, 1, NULL, NULL, 'Legendary Collection', 'Main Series Expansion', 110, '2002-05-24', 'base6');


-- e-Card Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (4, 1, NULL, NULL, 'Expedition Base Set', 'Main Series Expansion', 165, '2002-09-15', 'ecard1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (4, 2, NULL, NULL, 'Aquapolis', 'Main Series Expansion', 147, '2003-01-15', 'ecard2', 'Includes 32 Holofoil cards and 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (4, 3, NULL, NULL, 'Skyridge', 'Main Series Expansion', 144, '2003-05-12', 'ecard3', 'Includes 32 Holofoil cards and 6 secret cards');


-- EX Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 1, NULL, NULL, 'Ruby & Sapphire', 'Main Series Expansion', 109, '2003-07-18', 'ex1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 2, NULL, NULL, 'Sandstorm', 'Main Series Expansion', 100, '2003-09-18', 'ex2');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 3, NULL, NULL, 'Dragon', 'Main Series Expansion', 97, '2003-11-24', 'ex3', 'Includes 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 4, NULL, NULL, 'Team Magma vs Team Aqua', 'Main Series Expansion', 95, '2004-03-15', 'ex4', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 5, NULL, NULL, 'Hidden Legends', 'Main Series Expansion', 101, '2004-06-14', 'ex5', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 6, NULL, NULL, 'FireRed & LeafGreen', 'Main Series Expansion', 112, '2004-08-30', 'ex6', 'Includes 4 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 7, NULL, NULL, 'Team Rocket Returns', 'Main Series Expansion', 109, '2004-11-08', 'ex7', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 8, NULL, NULL, 'Deoxys', 'Main Series Expansion', 107, '2005-02-14', 'ex8', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 9, NULL, NULL, 'Emerald', 'Main Series Expansion', 106, '2005-05-09', 'ex9', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 10, NULL, NULL, 'Unseen Forces', 'Main Series Expansion', 115, '2005-08-22', 'ex10', 'Includes 2 secret cards and 28 Unown cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 11, NULL, NULL, 'Delta Species', 'Main Series Expansion', 113, '2005-10-31', 'ex11', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 12, NULL, NULL, 'Legend Maker', 'Main Series Expansion', 92, '2006-02-13', 'ex12', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 13, NULL, NULL, 'Holon Phantoms', 'Main Series Expansion', 110, '2006-05-03', 'ex13', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 14, NULL, NULL, 'Crystal Guardians', 'Main Series Expansion', 100, '2006-08-30', 'ex14');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 15, NULL, NULL, 'Dragon Frontiers', 'Main Series Expansion', 101, '2006-11-08', 'ex15');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 16, NULL, NULL, 'Power Keepers', 'Main Series Expansion', 108, '2007-02-14', 'ex16');


-- Diamond & Pearl Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 1, NULL, NULL, 'Diamond & Pearl', 'Main Series Expansion', 130, '2007-05-23', 'dp1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (6, 2, NULL, NULL, 'Mysterious Treasures', 'Main Series Expansion', 123, '2007-08-22', 'dp2', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 3, NULL, NULL, 'Secret Wonders', 'Main Series Expansion', 132, '2007-11-07', 'dp3');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 4, NULL, NULL, 'Great Encounters', 'Main Series Expansion', 106, '2008-02-13', 'dp4');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 5, NULL, NULL, 'Majestic Dawn', 'Main Series Expansion', 100, '2008-05-21', 'dp5');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 6, NULL, NULL, 'Legends Awakened', 'Main Series Expansion', 146, '2008-08-20', 'dp6');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (6, 7, NULL, NULL, 'Stormfront', 'Main Series Expansion', 100, '2008-11-05', 'dp7', 'Includes 3 secret cards and 3 shiny Pokémon cards');


-- Platinum Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 1, NULL, NULL, 'Platinum', 'Main Series Expansion', 127, '2009-02-11', 'pl1', 'Includes 3 secret cards and 3 shiny Pokémon cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 2, NULL, NULL, 'Rising Rivals', 'Main Series Expansion', 111, '2009-05-16', 'pl2', 'Includes 3 secret cards and 6 Rotom cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 3, NULL, NULL, 'Supreme Victors', 'Main Series Expansion', 147, '2009-08-19', 'pl3', 'Includes 3 secret cards and 3 shiny Pokémon cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 4, NULL, NULL, 'Arceus', 'Main Series Expansion', 99, '2009-11-04', 'pl4', 'Includes 9 Arceus cards and 3 shiny Pokémon cards');


-- HeartGold & SoulSilver Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 1, NULL, NULL, 'HeartGold & SoulSilver', 'Main Series Expansion', 123, '2010-02-10', 'hgss1', 'Includes 1 Alph Lithograph card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 2, NULL, NULL, 'Unleashed', 'Main Series Expansion', 95, '2010-05-12', 'hgss2', 'Includes 1 Alph Lithograph card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 3, NULL, NULL, 'Undaunted', 'Main Series Expansion', 90, '2010-08-18', 'hgss3', 'Includes 1 Alph Lithograph card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 4, NULL, NULL, 'Triumphant', 'Main Series Expansion', 102, '2010-11-03', 'hgss4', 'Includes 1 Alph Lithograph card');


-- Call of Legends Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (9, 1, NULL, NULL, 'Pokémon TCG: Call of Legends', 'Main Series Expansion', 95, '2011-02-09', 'col1', 'Includes 11 Shiny Legendary cards');


-- Black & White Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 1, NULL, NULL, 'Black & White', 'Main Series Expansion', 114, '2011-04-25', 'bw1', 'Includes 1 Secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (10, 2, NULL, NULL, 'Emerging Powers', 'Main Series Expansion', 98, '2011-08-31', 'bw2');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 3, NULL, NULL, 'Noble Victories', 'Main Series Expansion', 101, '2011-11-16', 'bw3', 'Includes 1 Secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 4, NULL, NULL, 'Next Destinies', 'Main Series Expansion', 99, '2012-02-08', 'bw4', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 5, NULL, NULL, 'Dark Explorers', 'Main Series Expansion', 108, '2012-05-09', 'bw5', 'Includes 3 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 6, NULL, NULL, 'Dragons Exalted', 'Main Series Expansion', 124, '2012-08-15', 'bw6', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 6.5, NULL, NULL, 'Dragon Vault', 'Special Expansion', 20, '2012-10-05', 'dv1', 'Includes 1 Secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 7, NULL, NULL, 'Boundaries Crossed', 'Main Series Expansion', 149, '2012-11-07', 'bw7', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 8, NULL, NULL, 'Plasma Storm', 'Main Series Expansion', 135, '2013-02-06', 'bw8', 'Includes 3 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 9, NULL, NULL, 'Plasma Freeze', 'Main Series Expansion', 116, '2013-05-08', 'bw9', 'Includes 6 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 10, NULL, NULL, 'Plasma Blast', 'Main Series Expansion', 101, '2013-08-14', 'bw10', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 11, NULL, NULL, 'Legendary Treasures', 'Main Series Expansion', 113, '2013-11-06', 'bw11', 'Includes 2 Secret cards and 25 Radiant Collection cards');


-- XY Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (11, 0, NULL, NULL, 'Kalos Starter Set', 'Special Expansion', 39, '2013-11-08', 'xy0');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (11, 1, NULL, NULL, 'XY', 'Main Series Expansion', 146, '2014-02-05', 'xy1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 2, NULL, NULL, 'Flashfire', 'Main Series Expansion', 106, '2014-05-07', 'xy2', 'Includes 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 3, NULL, NULL, 'Furious Fists', 'Main Series Expansion', 111, '2014-08-13', 'xy3', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 4, NULL, NULL, 'Phantom Forces', 'Main Series Expansion', 119, '2014-11-05', 'xy4', 'Includes 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 5, NULL, NULL, 'Primal Clash', 'Main Series Expansion', 160, '2015-02-04', 'xy5', 'Includes 4 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (11, 5.5, NULL, NULL, 'Double Crisis', 'Special Expansion', 34, '2015-03-25', 'dc1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 6, NULL, NULL, 'Roaring Skies', 'Main Series Expansion', 108, '2015-05-06', 'xy6', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 7, NULL, NULL, 'Ancient Origins', 'Main Series Expansion', 98, '2015-08-12', 'xy7', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 8, NULL, NULL, 'BREAKthrough', 'Main Series Expansion', 162, '2015-11-04', 'xy8', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 9, NULL, NULL, 'BREAKpoint', 'Main Series Expansion', 122, '2016-02-03', 'xy9', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 9.5, NULL, NULL, 'Generations', 'Special Expansion', 83, '2016-02-22', 'g1', 'Includes 32 Radiant Collection cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 10, NULL, NULL, 'Fates Collide', 'Main Series Expansion', 124, '2016-05-02', 'xy10', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 11, NULL, NULL, 'Steam Siege', 'Main Series Expansion', 114, '2016-08-03', 'xy11', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 12, NULL, NULL, 'Evolutions', 'Main Series Expansion', 108, '2016-11-02', 'xy12', 'Includes 5 secret cards');


-- Sun & Moon Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 1, NULL, NULL, 'Sun & Moon', 'Main Series Expansion', 149, '2017-02-03', 'sm1', 'Includes 14 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 2, NULL, NULL, 'Guardians Rising', 'Main Series Expansion', 145, '2017-05-05', 'sm2', 'Includes 24 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 3, NULL, NULL, 'Burning Shadows', 'Main Series Expansion', 147, '2017-08-04', 'sm3', 'Includes 22 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 3.5, NULL, NULL, 'Shining Legends', 'Special Expansion', 73, '2017-10-06', 'sm35', 'Includes 5 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 4, NULL, NULL, 'Crimson Invasion', 'Main Series Expansion', 111, '2017-11-03', 'sm4', 'Includes 13 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 5, NULL, NULL, 'Ultra Prism', 'Main Series Expansion', 156, '2018-02-02', 'sm5', 'Includes 17 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 6, NULL, NULL, 'Forbidden Light', 'Main Series Expansion', 131, '2018-05-04', 'sm6', 'Includes 15 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 7, NULL, NULL, 'Celestial Storm', 'Main Series Expansion', 168, '2018-08-03', 'sm7', 'Includes 15 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 7.5, NULL, NULL, 'Dragon Majesty', 'Special Expansion', 70, '2018-09-07', 'sm75', 'Includes 8 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 8, NULL, NULL, 'Lost Thunder', 'Main Series Expansion', 214, '2018-11-02', 'sm8', 'Includes 22 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 9, NULL, NULL, 'Team Up', 'Main Series Expansion', 181, '2019-02-01', 'sm9', 'Includes 15 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (12, 9.5, NULL, NULL, 'Detective Pikachu', 'Special Expansion', 18, '2019-03-29', 'det1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 10, NULL, NULL, 'Unbroken Bonds', 'Main Series Expansion', 214, '2019-05-03', 'sm10', 'Includes 20 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 11, NULL, NULL, 'Unified Minds', 'Main Series Expansion', 236, '2019-08-02', 'sm11', 'Includes 22 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 11.5, NULL, NULL, 'Hidden Fates', 'Special Expansion', 68, '2019-08-23', 'sm115', 'Includes 1 secret card and 94 Shiny Vault cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 12, NULL, NULL, 'Cosmic Eclipse', 'Main Series Expansion', 236, '2019-11-01', 'sm12', 'Includes 35 secret cards');


-- Sword & Shield Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 1, NULL, NULL, 'Sword & Shield', 'Main Series Expansion', 202, '2020-02-07', 'swsh1', 'Includes 14 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 2, NULL, NULL, 'Rebel Clash', 'Main Series Expansion', 192, '2020-05-01', 'swsh2', 'Includes 17 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 3, NULL, NULL, 'Darkness Ablaze', 'Main Series Expansion', 189, '2020-08-14', 'swsh3', 'Includes 12 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 3.5, NULL, NULL, 'Champions Path', 'Special Expansion', 73, '2020-09-25', 'swsh35', 'Includes 7 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 4, NULL, NULL, 'Vivid Voltage', 'Main Series Expansion', 185, '2020-11-13', 'swsh4', 'Includes 18 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 4.5, NULL, NULL, 'Shining Fates', 'Special Expansion', 72, '2021-02-19', 'swsh45', 'Includes 1 secret card and 122 Shiny Vault cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 5, NULL, NULL, 'Battle Styles', 'Main Series Expansion', 163, '2021-03-19', 'swsh5', 'Includes 20 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 6, NULL, NULL, 'Chilling Reign', 'Main Series Expansion', 198, '2021-06-18', 'swsh6', 'Includes 35 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 7, NULL, NULL, 'Evolving Skies', 'Main Series Expansion', 203, '2021-08-27', 'swsh7', 'Includes 34 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 7.5, NULL, NULL, 'Celebrations', 'Special Expansion', 25, '2021-10-08', 'cel25', 'Includes 25 Classic Collection cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 8, NULL, NULL, 'Fusion Strike', 'Main Series Expansion', 264, '2021-11-12', 'swsh8', 'Includes 20 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 9, NULL, NULL, 'Brilliant Stars', 'Main Series Expansion', 172, '2022-02-25', 'swsh9', 'Includes 14 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 10, NULL, NULL, 'Astral Radiance', 'Main Series Expansion', 189, '2022-05-27', 'swsh10', 'Includes 27 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 10.5, NULL, NULL, 'Pokémon TCG: Pokémon GO', 'Special Expansion', 78, '2022-07-01', 'pgo', 'Includes 10 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 11, NULL, NULL, 'Lost Origin', 'Main Series Expansion', 196, '2022-09-09', 'swsh11', 'Includes 21 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 12, NULL, NULL, 'Silver Tempest', 'Main Series Expansion', 195, '2022-11-11', 'swsh12', 'Includes 20 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 12.5, NULL, NULL, 'Crown Zenith', 'Special Expansion', 159, '2023-01-20', 'swsh12pt5', 'Includes 1 secret card and 70 Galarian Gallery cards');


-- Scarlet & Violet Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 1, NULL, NULL, 'Scarlet & Violet', 'Main Series Expansion', 198, '2023-03-31', 'sv1', 'Includes 60 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 2, NULL, NULL, 'Paldea Evolved', 'Main Series Expansion', 193, '2023-06-09', 'sv2', 'Includes 86 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 3, NULL, NULL, 'Obsidian Flames', 'Main Series Expansion', 197, '2023-08-11', 'sv3', 'Includes 33 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 3.5, NULL, NULL, '151', 'Special Expansion', 165, '2023-09-22', 'sv3pt5', 'Includes 42 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 4, NULL, NULL, 'Paradox Rift', 'Main Series Expansion', 182, '2023-11-03', 'sv4', 'Includes 84 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 4.5, NULL, NULL, 'Paldean Fates', 'Special Expansion', 91, '2024-01-26', 'sv4pt5', 'Includes 154 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 5, NULL, NULL, 'Temporal Forces', 'Main Series Expansion', 162, '2024-03-22', 'sv5', 'Includes 56 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 6, NULL, NULL, 'Twilight Masquerade', 'Main Series Expansion', 167, '2024-05-24', 'sv6', 'Includes 59 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 6.5, NULL, NULL, 'Shrouded Fable', 'Special Expansion', 64, '2024-08-02', 'sv6pt5', 'Includes 35 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 7, NULL, NULL, 'Stellar Crown', 'Main Series Expansion', 142, '2024-09-13', 'sv7', 'Includes 33 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 8, NULL, NULL, 'Surging Sparks', 'Main Series Expansion', 191, '2024-11-08', 'sv8', 'Includes 61 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 8.5, NULL, NULL, 'Prismatic Evolutions', 'Special Expansion', 131, '2025-01-17', 'sv8pt5', 'Includes 49 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 9, NULL, NULL, 'Journey Together', 'Main Series Expansion', 159, '2025-03-28', 'sv9', 'Includes 21+ secret cards');



INSERT INTO card_types (name, category) VALUES
 ('BREAK', 'BREAK'),
 ('Baby', 'Baby'),
 ('Basic', 'Basic'),
 ('EX', 'EX'),
 ('Goldenrod Game Corner', 'Goldenrod Game Corner'),
 ('Item', 'Item'),
 ('LEGEND', 'LEGEND'),
 ('Level-Up', 'Level-Up'),
 ('MEGA', 'MEGA'),
 ('Pokémon Tool', 'Pokémon Tool'),
 ('Pokémon Tool F', 'Pokémon Tool F'),
 ('Rapid Strike', 'Rapid Strike'),
 ('Restored', 'Restored'),
 ('Rockets Secret Machine', 'Rockets Secret Machine'),
 ('Single Strike', 'Single Strike'),
 ('Special', 'Special'),
 ('Stadium', 'Stadium'),
 ('Stage 1', 'Stage 1'),
 ('Stage 2', 'Stage 2'),
 ('TAG TEAM', 'TAG TEAM'),
 ('Technical Machine', 'Technical Machine'),
 ('V', 'V'),
 ('VMAX', 'VMAX')
ON CONFLICT (name) DO NOTHING;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO roles (name) VALUES ('user')  ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;

INSERT INTO users (username, email, password_hash)
VALUES (
	'admin',
	'admin@example.com',
	crypt('test123', gen_salt('bf', 12))
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
VALUES (
	(SELECT id FROM users WHERE username = 'admin'),
	(SELECT id FROM roles WHERE name = 'admin')
)
ON CONFLICT DO NOTHING;