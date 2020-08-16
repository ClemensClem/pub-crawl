DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS reset_codes CASCADE;
DROP Table IF EXISTS friendships CASCADE;
DROP Table IF EXISTS community_chat CASCADE;
DROP Table IF EXISTS  mapData CASCADE;
DROP Table IF EXISTS  event_participants CASCADE;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  first VARCHAR(255) NOT NULL,
  last VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR,
  bio TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE reset_codes(
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE friendships(
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) NOT NULL,
  receiver_id INT REFERENCES users(id) NOT NULL,
  accepted BOOLEAN DEFAULT FALSE NOT NULL
);


CREATE TABLE community_chat(
  id SERIAL PRIMARY KEY,
  msg TEXT,
  sender_id INT REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE mapData(
  id SERIAL PRIMARY KEY,
  host INT REFERENCES users(id) NOT NULL,
  map_data TEXT,
  title TEXT,
  description TEXT,
  start_date DATE,
  start_time TIME,
  event_picture_url VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_participants(
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES mapData(id) NOT NULL,
  participant_id INT REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);