DROP TABLE IF EXISTS logItem;
DROP TABLE IF EXISTS ausleihe;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS benutzer;

CREATE TABLE benutzer (
 id int auto_increment primary key,
 benutzername varchar(20) not null,
 vorname varchar(20) not null,
 nachname varchar(20) not null,
 password_hash VARBINARY (1000) not null,
 password_salt VARBINARY (1000) not null,
 role varchar(20) not null default 'USER',
 CONSTRAINT name_unique UNIQUE (benutzername)
)CHARACTER SET utf8mb4;


CREATE TABLE equipment (
 id int auto_increment primary key,
 inventarnummer varchar(20) not null,
 bezeichnung varchar(20) not null,
 CONSTRAINT bezeichnung_unique UNIQUE (inventarnummer)
)CHARACTER SET utf8mb4;

CREATE TABLE ausleihe (
 id int auto_increment primary key, 
 benutzer_id int NOT NULL,
 equipment_id int NOT null,
 ausleihe timestamp not null,
 FOREIGN KEY (benutzer_id) REFERENCES benutzer(id),
 FOREIGN KEY (equipment_id) REFERENCES equipment(id),
 CONSTRAINT equipment_unique UNIQUE (equipment_id),
 CONSTRAINT ausleihe_unique UNIQUE (benutzer_id, equipment_id)
)CHARACTER SET utf8mb4;

CREATE TABLE logitem (
 id int auto_increment primary key, 
 benutzername varchar(20) not null,
 equipmentinventarnummer varchar(20) not null,
 equipmentbezeichnung varchar(20) not null,
 ausleihdatum timestamp not null,
 rueckgabedatum timestamp
)CHARACTER SET utf8mb4;

