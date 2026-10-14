-- ============================================================
-- PROG2002 A3 — Database upgrade: registrations table + seed data
--
-- Run this on your EXISTING charityevents_db (A2 database):
--   mysql -u root -p charityevents_db < a3_update.sql
--
-- After running, export the FULL final database from MySQL
-- Workbench (Server -> Data Export) for your submission.
-- ============================================================

USE charityevents_db;

-- Registrations: records who registered for which event.
-- One person (identified by email) may register for many events,
-- but only ONCE per event -> unique key (event_id, user_email).
-- FK uses ON DELETE RESTRICT so an event with registrations
-- cannot be deleted (protects data integrity).
CREATE TABLE IF NOT EXISTS registrations (
    registration_id   INT AUTO_INCREMENT PRIMARY KEY,
    event_id          INT NOT NULL,
    user_name         VARCHAR(100) NOT NULL,
    user_email        VARCHAR(100) NOT NULL,
    contact_phone     VARCHAR(30),
    registration_date DATE NOT NULL,
    tickets           INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id)
        REFERENCES events (event_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_event_email (event_id, user_email)
) ENGINE=InnoDB;

-- Sample registrations (12 rows, across events 1-6)
INSERT INTO registrations
(event_id, user_name, user_email, contact_phone, registration_date, tickets) VALUES
(1, 'Alice Smith',  'alice.smith@example.com',  '0412 345 678', '2026-09-05', 2),
(1, 'Bob Jones',    'bob.jones@example.com',    '0423 456 789', '2026-09-18', 1),
(1, 'Carol White',  'carol.white@example.com',  '0434 567 890', '2026-09-25', 3),
(2, 'David Brown',  'david.brown@example.com',  '0445 678 901', '2026-09-10', 1),
(2, 'Emma Green',   'emma.green@example.com',   '0456 789 012', '2026-09-22', 2),
(3, 'Frank Black',  'frank.black@example.com',  '0467 890 123', '2026-09-08', 1),
(3, 'Grace Adams',  'grace.adams@example.com',  '0478 901 234', '2026-09-15', 4),
(4, 'Henry Clark',  'henry.clark@example.com',  '0489 012 345', '2026-09-20', 2),
(4, 'Ivy Turner',   'ivy.turner@example.com',   '0490 123 456', '2026-09-27', 1),
(5, 'Jack Wilson',  'jack.wilson@example.com',  '0411 222 333', '2026-09-12', 2),
(5, 'Kylie Moore',  'kylie.moore@example.com',  '0422 333 444', '2026-09-21', 1),
(6, 'Liam Scott',   'liam.scott@example.com',   '0433 444 555', '2026-09-19', 3);
-- （注：内容由AI生成）
