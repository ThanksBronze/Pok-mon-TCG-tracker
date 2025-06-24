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
	no_in_set INTEGER,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMP NULL,
	CONSTRAINT uq_cards_user_set_name UNIQUE (user_id, set_id, name)
);

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
BEGIN
	FOR tbl IN ARRAY[
		'users','roles','user_roles','series','card_types','sets','cards','categories','card_categories','notes'
	] LOOP
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
$$;


CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type_id);
CREATE INDEX IF NOT EXISTS idx_card_categories_category ON card_categories(category_id);

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
VALUES (1, 1, NULL, NULL, 'Base Set', 'Main Series Expansion', 102, '1999-01-09', 'BS');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 2, NULL, NULL, 'Jungle', 'Main Series Expansion', 64, '1999-06-16', 'JU');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 3, NULL, NULL, 'Fossil', 'Main Series Expansion', 62, '1999-10-10', 'FO');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 4, NULL, NULL, 'Base Set 2', 'Main Series Expansion', 130, '2000-02-24', 'B2');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (1, 5, NULL, NULL, 'Team Rocket', 'Main Series Expansion', 82, '2000-04-24', 'TR', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 6, NULL, NULL, 'Gym Heroes', 'Main Series Expansion', 132, '2000-08-14', 'G1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (1, 7, NULL, NULL, 'Gym Challenge', 'Main Series Expansion', 132, '2000-10-16', 'G2');

-- Neo Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (2, 1, NULL, NULL, 'Neo Genesis', 'Main Series Expansion', 111, '2000-12-16', 'N1');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (2, 2, NULL, NULL, 'Neo Discovery', 'Main Series Expansion', 75, '2001-06-01', 'N2');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (2, 3, NULL, NULL, 'Neo Revelation', 'Main Series Expansion', 64, '2001-09-21', 'N3', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (2, 4, NULL, NULL, 'Neo Destiny', 'Main Series Expansion', 105, '2002-02-28', 'N4', 'Includes 8 secret cards');


-- Legendary Collection Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (3, 1, NULL, NULL, 'Legendary Collection', 'Main Series Expansion', 110, '2002-05-24', 'LC');


-- e-Card Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (4, 1, NULL, NULL, 'Expedition Base Set', 'Main Series Expansion', 165, '2002-09-15', 'EX');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (4, 2, NULL, NULL, 'Aquapolis', 'Main Series Expansion', 147, '2003-01-15', 'AQ', 'Includes 32 Holofoil cards and 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (4, 3, NULL, NULL, 'Skyridge', 'Main Series Expansion', 144, '2003-05-12', 'SK', 'Includes 32 Holofoil cards and 6 secret cards');


-- EX Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 1, NULL, NULL, 'EX Ruby & Sapphire', 'Main Series Expansion', 109, '2003-07-18', 'RS');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 2, NULL, NULL, 'EX Sandstorm', 'Main Series Expansion', 100, '2003-09-18', 'SS');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 3, NULL, NULL, 'EX Dragon', 'Main Series Expansion', 97, '2003-11-24', 'DR', 'Includes 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 4, NULL, NULL, 'EX Team Magma vs Team Aqua', 'Main Series Expansion', 95, '2004-03-15', 'MA', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 5, NULL, NULL, 'EX Hidden Legends', 'Main Series Expansion', 101, '2004-06-14', 'HL', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 6, NULL, NULL, 'EX FireRed & LeafGreen', 'Main Series Expansion', 112, '2004-08-30', 'RG', 'Includes 4 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 7, NULL, NULL, 'EX Team Rocket Returns', 'Main Series Expansion', 109, '2004-11-08', 'TRR', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 8, NULL, NULL, 'EX Deoxys', 'Main Series Expansion', 107, '2005-02-14', 'DX', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 9, NULL, NULL, 'EX Emerald', 'Main Series Expansion', 106, '2005-05-09', 'EM', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 10, NULL, NULL, 'EX Unseen Forces', 'Main Series Expansion', 115, '2005-08-22', 'UF', 'Includes 2 secret cards and 28 Unown cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 11, NULL, NULL, 'EX Delta Species', 'Main Series Expansion', 113, '2005-10-31', 'DS', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 12, NULL, NULL, 'EX Legend Maker', 'Main Series Expansion', 92, '2006-02-13', 'LM', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (5, 13, NULL, NULL, 'EX Holon Phantoms', 'Main Series Expansion', 110, '2006-05-03', 'HP', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 14, NULL, NULL, 'EX Crystal Guardians', 'Main Series Expansion', 100, '2006-08-30', 'CG');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 15, NULL, NULL, 'EX Dragon Frontiers', 'Main Series Expansion', 101, '2006-11-08', 'DF');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (5, 16, NULL, NULL, 'EX Power Keepers', 'Main Series Expansion', 108, '2007-02-14', 'PK');


-- Diamond & Pearl Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 1, NULL, NULL, 'Diamond & Pearl', 'Main Series Expansion', 130, '2007-05-23', 'DP');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (6, 2, NULL, NULL, 'Diamond & Pearl—Mysterious Treasures', 'Main Series Expansion', 123, '2007-08-22', 'MT', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 3, NULL, NULL, 'Diamond & Pearl—Secret Wonders', 'Main Series Expansion', 132, '2007-11-07', 'SW');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 4, NULL, NULL, 'Diamond & Pearl—Great Encounters', 'Main Series Expansion', 106, '2008-02-13', 'GE');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 5, NULL, NULL, 'Diamond & Pearl—Majestic Dawn', 'Main Series Expansion', 100, '2008-05-21', 'MD');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (6, 6, NULL, NULL, 'Diamond & Pearl—Legends Awakened', 'Main Series Expansion', 146, '2008-08-20', 'LA');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (6, 7, NULL, NULL, 'Diamond & Pearl—Stormfront', 'Main Series Expansion', 100, '2008-11-05', 'SF', 'Includes 3 secret cards and 3 shiny Pokémon cards');


-- Platinum Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 1, NULL, NULL, 'Platinum', 'Main Series Expansion', 127, '2009-02-11', 'PL', 'Includes 3 secret cards and 3 shiny Pokémon cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 2, NULL, NULL, 'Platinum—Rising Rivals', 'Main Series Expansion', 111, '2009-05-16', 'RR', 'Includes 3 secret cards and 6 Rotom cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 3, NULL, NULL, 'Platinum—Supreme Victors', 'Main Series Expansion', 147, '2009-08-19', 'SV', 'Includes 3 secret cards and 3 shiny Pokémon cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (7, 4, NULL, NULL, 'Platinum—Arceus', 'Main Series Expansion', 99, '2009-11-04', 'AR', 'Includes 9 Arceus cards and 3 shiny Pokémon cards');


-- HeartGold & SoulSilver Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 1, NULL, NULL, 'HeartGold & SoulSilver', 'Main Series Expansion', 123, '2010-02-10', 'HS', 'Includes 1 Alph Lithograph card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 2, NULL, NULL, 'HS—Unleashed', 'Main Series Expansion', 95, '2010-05-12', 'UL', 'Includes 1 Alph Lithograph card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 3, NULL, NULL, 'HS—Undaunted', 'Main Series Expansion', 90, '2010-08-18', 'UD', 'Includes 1 Alph Lithograph card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (8, 4, NULL, NULL, 'HS—Triumphant', 'Main Series Expansion', 102, '2010-11-03', 'TM', 'Includes 1 Alph Lithograph card');


-- Call of Legends Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (9, 1, NULL, NULL, 'Pokémon TCG: Call of Legends', 'Main Series Expansion', 95, '2011-02-09', 'CL', 'Includes 11 Shiny Legendary cards');


-- Black & White Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 1, NULL, NULL, 'Black & White', 'Main Series Expansion', 114, '2011-04-25', 'BLW', 'Includes 1 Secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (10, 2, NULL, NULL, 'Black & White—Emerging Powers', 'Main Series Expansion', 98, '2011-08-31', 'EPO');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 3, NULL, NULL, 'Black & White—Noble Victories', 'Main Series Expansion', 101, '2011-11-16', 'NVI', 'Includes 1 Secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 4, NULL, NULL, 'Black & White—Next Destinies', 'Main Series Expansion', 99, '2012-02-08', 'NXD', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 5, NULL, NULL, 'Black & White—Dark Explorers', 'Main Series Expansion', 108, '2012-05-09', 'DEX', 'Includes 3 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 6, NULL, NULL, 'Black & White—Dragons Exalted', 'Main Series Expansion', 124, '2012-08-15', 'DRX', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 6.5, NULL, NULL, 'Dragon Vault', 'Special Expansion', 20, '2012-10-05', 'DRV', 'Includes 1 Secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 7, NULL, NULL, 'Black & White—Boundaries Crossed', 'Main Series Expansion', 149, '2012-11-07', 'BCR', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 8, NULL, NULL, 'Black & White—Plasma Storm', 'Main Series Expansion', 135, '2013-02-06', 'PLS', 'Includes 3 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 9, NULL, NULL, 'Black & White—Plasma Freeze', 'Main Series Expansion', 116, '2013-05-08', 'PLF', 'Includes 6 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 10, NULL, NULL, 'Black & White—Plasma Blast', 'Main Series Expansion', 101, '2013-08-14', 'PLB', 'Includes 4 Secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (10, 11, NULL, NULL, 'Black & White—Legendary Treasures', 'Main Series Expansion', 113, '2013-11-06', 'LTR', 'Includes 2 Secret cards and 25 Radiant Collection cards');


-- XY Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (11, 0, NULL, NULL, 'XY—Kalos Starter Set', 'Special Expansion', 39, '2013-11-08', 'KSS');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (11, 1, NULL, NULL, 'XY', 'Main Series Expansion', 146, '2014-02-05', 'XY');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 2, NULL, NULL, 'XY—Flashfire', 'Main Series Expansion', 106, '2014-05-07', 'FLF', 'Includes 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 3, NULL, NULL, 'XY—Furious Fists', 'Main Series Expansion', 111, '2014-08-13', 'FFI', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 4, NULL, NULL, 'XY—Phantom Forces', 'Main Series Expansion', 119, '2014-11-05', 'PHF', 'Includes 3 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 5, NULL, NULL, 'XY—Primal Clash', 'Main Series Expansion', 160, '2015-02-04', 'PRC', 'Includes 4 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (11, 5.5, NULL, NULL, 'Double Crisis', 'Special Expansion', 34, '2015-03-25', 'DCR');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 6, NULL, NULL, 'XY—Roaring Skies', 'Main Series Expansion', 108, '2015-05-06', 'ROS', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 7, NULL, NULL, 'XY—Ancient Origins', 'Main Series Expansion', 98, '2015-08-12', 'AOR', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 8, NULL, NULL, 'XY—BREAKthrough', 'Main Series Expansion', 162, '2015-11-04', 'BKT', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 9, NULL, NULL, 'XY—BREAKpoint', 'Main Series Expansion', 122, '2016-02-03', 'BKP', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 9.5, NULL, NULL, 'Generations', 'Special Expansion', 83, '2016-02-22', 'GEN', 'Includes 32 Radiant Collection cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 10, NULL, NULL, 'XY—Fates Collide', 'Main Series Expansion', 124, '2016-05-02', 'FCO', 'Includes 1 secret card');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 11, NULL, NULL, 'XY—Steam Siege', 'Main Series Expansion', 114, '2016-08-03', 'STS', 'Includes 2 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (11, 12, NULL, NULL, 'XY—Evolutions', 'Main Series Expansion', 108, '2016-11-02', 'EVO', 'Includes 5 secret cards');


-- Sun & Moon Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 1, NULL, NULL, 'Sun & Moon', 'Main Series Expansion', 149, '2017-02-03', 'SUM', 'Includes 14 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 2, NULL, NULL, 'Sun & Moon—Guardians Rising', 'Main Series Expansion', 145, '2017-05-05', 'GRI', 'Includes 24 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 3, NULL, NULL, 'Sun & Moon—Burning Shadows', 'Main Series Expansion', 147, '2017-08-04', 'BUS', 'Includes 22 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 3.5, NULL, NULL, 'Shining Legends', 'Special Expansion', 73, '2017-10-06', 'SLG', 'Includes 5 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 4, NULL, NULL, 'Sun & Moon—Crimson Invasion', 'Main Series Expansion', 111, '2017-11-03', 'CIN', 'Includes 13 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 5, NULL, NULL, 'Sun & Moon—Ultra Prism', 'Main Series Expansion', 156, '2018-02-02', 'UPR', 'Includes 17 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 6, NULL, NULL, 'Sun & Moon—Forbidden Light', 'Main Series Expansion', 131, '2018-05-04', 'FLI', 'Includes 15 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 7, NULL, NULL, 'Sun & Moon—Celestial Storm', 'Main Series Expansion', 168, '2018-08-03', 'CES', 'Includes 15 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 7.5, NULL, NULL, 'Dragon Majesty', 'Special Expansion', 70, '2018-09-07', 'DRM', 'Includes 8 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 8, NULL, NULL, 'Sun & Moon—Lost Thunder', 'Main Series Expansion', 214, '2018-11-02', 'LOT', 'Includes 22 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 9, NULL, NULL, 'Sun & Moon—Team Up', 'Main Series Expansion', 181, '2019-02-01', 'TEU', 'Includes 15 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb)
VALUES (12, 9.5, NULL, NULL, 'Detective Pikachu', 'Special Expansion', 18, '2019-03-29', 'DET');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 10, NULL, NULL, 'Sun & Moon—Unbroken Bonds', 'Main Series Expansion', 214, '2019-05-03', 'UNB', 'Includes 20 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 11, NULL, NULL, 'Sun & Moon—Unified Minds', 'Main Series Expansion', 236, '2019-08-02', 'UNM', 'Includes 22 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 11.5, NULL, NULL, 'Hidden Fates', 'Special Expansion', 68, '2019-08-23', 'HIF', 'Includes 1 secret card and 94 Shiny Vault cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (12, 12, NULL, NULL, 'Sun & Moon—Cosmic Eclipse', 'Main Series Expansion', 236, '2019-11-01', 'CEC', 'Includes 35 secret cards');


-- Sword & Shield Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 1, NULL, NULL, 'Sword & Shield', 'Main Series Expansion', 202, '2020-02-07', 'SSH', 'Includes 14 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 2, NULL, NULL, 'Sword & Shield—Rebel Clash', 'Main Series Expansion', 192, '2020-05-01', 'RCL', 'Includes 17 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 3, NULL, NULL, 'Sword & Shield—Darkness Ablaze', 'Main Series Expansion', 189, '2020-08-14', 'DAA', 'Includes 12 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 3.5, NULL, NULL, 'Champions Path', 'Special Expansion', 73, '2020-09-25', 'CPA', 'Includes 7 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 4, NULL, NULL, 'Sword & Shield—Vivid Voltage', 'Main Series Expansion', 185, '2020-11-13', 'VIV', 'Includes 18 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 4.5, NULL, NULL, 'Shining Fates', 'Special Expansion', 72, '2021-02-19', 'SHF', 'Includes 1 secret card and 122 Shiny Vault cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 5, NULL, NULL, 'Sword & Shield—Battle Styles', 'Main Series Expansion', 163, '2021-03-19', 'BST', 'Includes 20 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 6, NULL, NULL, 'Sword & Shield—Chilling Reign', 'Main Series Expansion', 198, '2021-06-18', 'CRE', 'Includes 35 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 7, NULL, NULL, 'Sword & Shield—Evolving Skies', 'Main Series Expansion', 203, '2021-08-27', 'EVS', 'Includes 34 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 7.5, NULL, NULL, 'Celebrations', 'Special Expansion', 25, '2021-10-08', 'CEL', 'Includes 25 Classic Collection cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 8, NULL, NULL, 'Sword & Shield—Fusion Strike', 'Main Series Expansion', 264, '2021-11-12', 'FST', 'Includes 20 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 9, NULL, NULL, 'Sword & Shield—Brilliant Stars', 'Main Series Expansion', 172, '2022-02-25', 'BRS', 'Includes 14 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 10, NULL, NULL, 'Sword & Shield—Astral Radiance', 'Main Series Expansion', 189, '2022-05-27', 'ASR', 'Includes 27 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 10.5, NULL, NULL, 'Pokémon TCG: Pokémon GO', 'Special Expansion', 78, '2022-07-01', 'PGO', 'Includes 10 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 11, NULL, NULL, 'Sword & Shield—Lost Origin', 'Main Series Expansion', 196, '2022-09-09', 'LOR', 'Includes 21 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 12, NULL, NULL, 'Sword & Shield—Silver Tempest', 'Main Series Expansion', 195, '2022-11-11', 'SIT', 'Includes 20 secret cards and 30 Trainer Gallery cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (13, 12.5, NULL, NULL, 'Crown Zenith', 'Special Expansion', 159, '2023-01-20', 'CRZ', 'Includes 1 secret card and 70 Galarian Gallery cards');


-- Scarlet & Violet Series
INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 1, NULL, NULL, 'Scarlet & Violet', 'Main Series Expansion', 198, '2023-03-31', 'SVI', 'Includes 60 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 2, NULL, NULL, 'Scarlet & Violet—Paldea Evolved', 'Main Series Expansion', 193, '2023-06-09', 'PAL', 'Includes 86 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 3, NULL, NULL, 'Scarlet & Violet—Obsidian Flames', 'Main Series Expansion', 197, '2023-08-11', 'OBF', 'Includes 33 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 3.5, NULL, NULL, 'Scarlet & Violet—151', 'Special Expansion', 165, '2023-09-22', 'MEW', 'Includes 42 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 4, NULL, NULL, 'Scarlet & Violet—Paradox Rift', 'Main Series Expansion', 182, '2023-11-03', 'PAR', 'Includes 84 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 4.5, NULL, NULL, 'Scarlet & Violet—Paldean Fates', 'Special Expansion', 91, '2024-01-26', 'PAF', 'Includes 154 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 5, NULL, NULL, 'Scarlet & Violet—Temporal Forces', 'Main Series Expansion', 162, '2024-03-22', 'TEF', 'Includes 56 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 6, NULL, NULL, 'Scarlet & Violet—Twilight Masquerade', 'Main Series Expansion', 167, '2024-05-24', 'TWM', 'Includes 59 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 6.5, NULL, NULL, 'Scarlet & Violet—Shrouded Fable', 'Special Expansion', 64, '2024-08-02', 'SFA', 'Includes 35 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 7, NULL, NULL, 'Scarlet & Violet—Stellar Crown', 'Main Series Expansion', 142, '2024-09-13', 'SCR', 'Includes 33 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 8, NULL, NULL, 'Scarlet & Violet—Surging Sparks', 'Main Series Expansion', 191, '2024-11-08', 'SSP', 'Includes 61 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 8.5, NULL, NULL, 'Scarlet & Violet—Prismatic Evolutions', 'Special Expansion', 131, '2025-01-17', 'PRE', 'Includes 49 secret cards');

INSERT INTO sets (series_id, set_no, symbol, logo, name_of_expansion, type_of_expansion, no_of_cards, release_date, set_abb, notes)
VALUES (14, 9, NULL, NULL, 'Scarlet & Violet—Journey Together', 'Main Series Expansion', 159, '2025-03-28', 'JTG', 'Includes 21+ secret cards');
