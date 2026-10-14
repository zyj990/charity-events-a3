// ============================================================
// api/server.js
// PROG2002 A3 - Express RESTful API (full CRUD) for the
// charity events website (client + admin).
//
// Run:  cd api  ->  node server.js  ->  http://localhost:3000
//
// Endpoints:
//   GET    /api/events            Home: active & upcoming events (with category)
//   GET    /api/events/all        Admin: ALL events (any status) + registration count
//   GET    /api/categories        Categories for dropdowns
//   GET    /api/organisations     Organisations for admin forms
//   GET    /api/events/search     Filter: ?date=&location=&category=
//   GET    /api/events/:id        One event + its registrations (latest first)
//   POST   /api/events            Admin: create a new event
//   PUT    /api/events/:id        Admin: update an event
//   DELETE /api/events/:id        Admin: delete (blocked if registrations exist)
//   POST   /api/registrations     User: register for an event
// ============================================================

const express = require('express');
const cors = require('cors');
const db = require('../database/event_db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// Home page: current & upcoming active events, with category
// ------------------------------------------------------------
app.get('/api/events', async (req, res, next) => {
    try {
        const sql = `
            SELECT e.event_id, e.name, e.event_date, e.event_time, e.location,
                   e.ticket_price, e.image_url, c.name AS category
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            WHERE e.status = 'active' AND e.event_date >= CURDATE()
            ORDER BY e.event_date ASC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Admin: ALL events (active / past / suspended) + reg count
// ------------------------------------------------------------
app.get('/api/events/all', async (req, res, next) => {
    try {
        const sql = `
            SELECT e.event_id, e.name, e.event_date, e.event_time, e.location,
                   e.ticket_price, e.status, e.goal_amount, e.raised_amount,
                   c.name AS category,
                   (SELECT COUNT(*) FROM registrations r
                    WHERE r.event_id = e.event_id) AS registration_count
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            ORDER BY e.event_date DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Categories + Organisations for dropdowns
// ------------------------------------------------------------
app.get('/api/categories', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT category_id, name FROM categories ORDER BY name'
        );
        res.json(rows);
    } catch (err) { next(err); }
});

app.get('/api/organisations', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT organisation_id, name FROM organisations ORDER BY name'
        );
        res.json(rows);
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Search: filter active events by date / location / category
// ------------------------------------------------------------
app.get('/api/events/search', async (req, res, next) => {
    try {
        const { date, location, category } = req.query;
        let sql = `
            SELECT e.event_id, e.name, e.event_date, e.event_time, e.location,
                   e.ticket_price, c.name AS category
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            WHERE e.status = 'active'
        `;
        const params = [];
        if (date) { sql += ' AND e.event_date = ?'; params.push(date); }
        if (location) { sql += ' AND e.location LIKE ?'; params.push('%' + location + '%'); }
        if (category) { sql += ' AND e.category_id = ?'; params.push(category); }
        sql += ' ORDER BY e.event_date ASC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Event detail: event + all its registrations (latest first)
// ------------------------------------------------------------
app.get('/api/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT e.event_id, e.name, e.description, e.purpose,
                   e.event_date, e.event_time, e.location,
                   e.ticket_price, e.goal_amount, e.raised_amount, e.image_url,
                   c.name AS category, o.name AS organisation, o.mission
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            JOIN organisations o ON e.organisation_id = o.organisation_id
            WHERE e.event_id = ? AND e.status = 'active'
        `;
        const [eventRows] = await db.query(sql, [id]);
        if (eventRows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const [regRows] = await db.query(`
            SELECT registration_id, user_name, user_email, contact_phone,
                   registration_date, tickets
            FROM registrations
            WHERE event_id = ?
            ORDER BY registration_date DESC, registration_id DESC
        `, [id]);

        res.json({ ...eventRows[0], registrations: regRows });
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Admin: create a new event (POST)
// ------------------------------------------------------------
app.post('/api/events', async (req, res, next) => {
    try {
        const b = req.body;
        if (!b.name || !b.event_date || !b.location || !b.category_id || !b.organisation_id) {
            return res.status(400).json({
                error: 'Missing required fields: name, event_date, location, category_id, organisation_id'
            });
        }
        const [result] = await db.query(`
            INSERT INTO events
            (name, description, purpose, event_date, event_time, location,
             category_id, organisation_id, ticket_price, goal_amount,
             raised_amount, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            b.name, b.description || '', b.purpose || '',
            b.event_date, b.event_time || null, b.location,
            b.category_id, b.organisation_id,
            b.ticket_price || 0, b.goal_amount || 0,
            b.raised_amount || 0, b.status || 'active', b.image_url || null
        ]);
        res.status(201).json({ event_id: result.insertId, message: 'Event created successfully' });
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Admin: event detail regardless of status (for the Edit form)
// Public clients use GET /api/events/:id (active events only).
// ------------------------------------------------------------
app.get('/api/admin/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT e.event_id, e.name, e.description, e.purpose,
                   e.event_date, e.event_time, e.location,
                   e.ticket_price, e.goal_amount, e.raised_amount,
                   e.status, e.image_url, e.category_id, e.organisation_id,
                   c.name AS category, o.name AS organisation
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            JOIN organisations o ON e.organisation_id = o.organisation_id
            WHERE e.event_id = ?
        `;
        const [eventRows] = await db.query(sql, [id]);
        if (eventRows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const [regRows] = await db.query(`
            SELECT registration_id, user_name, user_email, contact_phone,
                   registration_date, tickets
            FROM registrations
            WHERE event_id = ?
            ORDER BY registration_date DESC, registration_id DESC
        `, [id]);

        res.json({ ...eventRows[0], registrations: regRows });
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Admin: update an existing event (PUT)
// ------------------------------------------------------------
app.put('/api/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT event_id FROM events WHERE event_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const b = req.body;
        await db.query(`
            UPDATE events SET
                name = ?, description = ?, purpose = ?, event_date = ?,
                event_time = ?, location = ?, category_id = ?,
                organisation_id = ?, ticket_price = ?, goal_amount = ?,
                raised_amount = ?, status = ?, image_url = ?
            WHERE event_id = ?
        `, [
            b.name, b.description || '', b.purpose || '',
            b.event_date, b.event_time || null, b.location,
            b.category_id, b.organisation_id,
            b.ticket_price || 0, b.goal_amount || 0,
            b.raised_amount || 0, b.status || 'active', b.image_url || null,
            id
        ]);
        res.json({ message: 'Event updated successfully' });
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// Admin: delete an event — blocked if registrations exist
// ------------------------------------------------------------
app.delete('/api/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT event_id FROM events WHERE event_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const [regs] = await db.query(
            'SELECT COUNT(*) AS cnt FROM registrations WHERE event_id = ?', [id]
        );
        if (regs[0].cnt > 0) {
            return res.status(400).json({
                error: `Cannot delete: this event has ${regs[0].cnt} registration(s).`
            });
        }

        await db.query('DELETE FROM events WHERE event_id = ?', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// User: register for an event (POST)
// One email can register for the same event only once.
// ------------------------------------------------------------
app.post('/api/registrations', async (req, res, next) => {
    try {
        const b = req.body;
        if (!b.event_id || !b.user_name || !b.user_email || !b.registration_date) {
            return res.status(400).json({
                error: 'Missing required fields: event_id, user_name, user_email, registration_date'
            });
        }

        const [ev] = await db.query('SELECT event_id, status FROM events WHERE event_id = ?', [b.event_id]);
        if (ev.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (ev[0].status !== 'active') {
            return res.status(400).json({ error: 'This event is not open for registration' });
        }

        const tickets = Math.max(1, parseInt(b.tickets, 10) || 1);

        const [dup] = await db.query(
            'SELECT registration_id FROM registrations WHERE event_id = ? AND user_email = ?',
            [b.event_id, b.user_email]
        );
        if (dup.length > 0) {
            return res.status(400).json({ error: 'You have already registered for this event' });
        }

        const [result] = await db.query(`
            INSERT INTO registrations
            (event_id, user_name, user_email, contact_phone, registration_date, tickets)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [b.event_id, b.user_name, b.user_email, b.contact_phone || null, b.registration_date, tickets]);

        res.status(201).json({
            registration_id: result.insertId,
            message: 'Registration successful'
        });
    } catch (err) { next(err); }
});

// ------------------------------------------------------------
// 404 + central error handler
// ------------------------------------------------------------
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});
//（注：内容由AI生成）
