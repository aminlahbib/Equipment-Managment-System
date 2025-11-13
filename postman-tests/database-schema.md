# Database Schema Reference

Complete database schema for Equipment Management System.

## Tables

### benutzer (Users)
```sql
CREATE TABLE benutzer (
    id int auto_increment primary key,
    benutzername varchar(20) not null,
    vorname varchar(20) not null,
    nachname varchar(20) not null,
    password_hash VARBINARY(1000) not null,
    password_salt VARBINARY(1000) not null,
    CONSTRAINT name_unique UNIQUE (benutzername)
) CHARACTER SET utf8mb4;
```

**Fields:**
- `id`: Primary key, auto-increment
- `benutzername`: Username (unique, max 20 chars)
- `vorname`: First name (max 20 chars)
- `nachname`: Last name (max 20 chars)
- `password_hash`: BCrypt hashed password with salt
- `password_salt`: Random salt for password hashing

**Constraints:**
- `benutzername` must be unique

### equipment (Equipment Items)
```sql
CREATE TABLE equipment (
    id int auto_increment primary key,
    inventarnummer varchar(20) not null,
    bezeichnung varchar(20) not null,
    CONSTRAINT bezeichnung_unique UNIQUE (inventarnummer)
) CHARACTER SET utf8mb4;
```

**Fields:**
- `id`: Primary key, auto-increment
- `inventarnummer`: Inventory number (unique, max 20 chars)
- `bezeichnung`: Equipment description/name (max 20 chars)

**Constraints:**
- `inventarnummer` must be unique

**Mock Data:**
- C12 - Cannon Kamera
- C34X - Cannon Micro
- SoK4 - Sony Kamera
- MacB1, MacB2, MacB3 - MacBook
- MacI1 - iPad
- MS1 - Microsoft Surface
- LMx3 - Logitech Maus

### ausleihe (Active Loans)
```sql
CREATE TABLE ausleihe (
    id int auto_increment primary key,
    benutzer_id int NOT NULL,
    equipment_id int NOT NULL,
    ausleihe timestamp not null,
    FOREIGN KEY (benutzer_id) REFERENCES benutzer(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT equipment_unique UNIQUE (equipment_id),
    CONSTRAINT ausleihe_unique UNIQUE (benutzer_id, equipment_id)
) CHARACTER SET utf8mb4;
```

**Fields:**
- `id`: Primary key, auto-increment
- `benutzer_id`: Foreign key to benutzer.id
- `equipment_id`: Foreign key to equipment.id
- `ausleihe`: Timestamp when equipment was borrowed

**Constraints:**
- `equipment_id` must be unique (one equipment can only be borrowed by one user)
- `benutzer_id` + `equipment_id` combination must be unique
- Foreign key constraints ensure referential integrity

**Business Logic:**
- Represents currently active loans
- When equipment is returned, record is deleted and moved to `logitem`

### logitem (Loan History)
```sql
CREATE TABLE logitem (
    id int auto_increment primary key,
    benutzername varchar(20) not null,
    equipmentinventarnummer varchar(20) not null,
    equipmentbezeichnung varchar(20) not null,
    ausleihdatum timestamp not null,
    rueckgabedatum timestamp
) CHARACTER SET utf8mb4;
```

**Fields:**
- `id`: Primary key, auto-increment
- `benutzername`: Username (denormalized, max 20 chars)
- `equipmentinventarnummer`: Inventory number (denormalized, max 20 chars)
- `equipmentbezeichnung`: Equipment description (denormalized, max 20 chars)
- `ausleihdatum`: Timestamp when equipment was borrowed
- `rueckgabedatum`: Timestamp when equipment was returned (nullable)

**Business Logic:**
- Denormalized table for historical records
- Created when equipment is returned
- Contains snapshot of loan data at return time
- Used for reporting and audit trail

## Relationships

```
benutzer (1) ──< (many) ausleihe
equipment (1) ──< (1) ausleihe
```

- One user can have many active loans
- One equipment can only have one active loan (unique constraint)
- When loan is completed, it's moved to `logitem` (no foreign keys)

## Data Flow

### Borrowing Equipment
1. User borrows equipment via `POST /api/benutzer/ausleihen/{equipmentId}`
2. Record created in `ausleihe` table
3. Equipment becomes unavailable (not in available equipment list)

### Returning Equipment
1. User returns equipment via `POST /api/benutzer/rueckgabe/{equipmentId}`
2. Record created in `logitem` table with return timestamp
3. Record deleted from `ausleihe` table
4. Equipment becomes available again

## Field Lengths

All string fields have maximum length of 20 characters:
- `benutzername`: 20 chars
- `vorname`: 20 chars
- `nachname`: 20 chars
- `inventarnummer`: 20 chars
- `bezeichnung`: 20 chars

## Character Set

All tables use `utf8mb4` character set for full Unicode support.

