PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_patient TEXT NOT NULL,
    phone_patient TEXT,
    email_patient TEXT
);
CREATE TABLE IF NOT EXISTS office (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_office TEXT NOT NULL,
    location_office TEXT
);
CREATE TABLE IF NOT EXISTS appointment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    date_appointment TEXT NOT NULL, -- ISO string
    reason_appointment TEXT,
    FOREIGN KEY (office_id) REFERENCES office(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS appointment_patient (
    appointment_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    PRIMARY KEY (appointment_id, patient_id),
    FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);