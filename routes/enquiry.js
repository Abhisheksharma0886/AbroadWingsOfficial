'use strict';
const express   = require('express');
const router    = express.Router();
const validator = require('validator');
const crypto    = require('crypto');
const { getDb, persist } = require('../db/init');

const sanitise = (s) => (typeof s === 'string' ? s.trim().slice(0, 2000) : '');
const hashIp   = (ip) => crypto.createHash('sha256').update(String(ip || '')).digest('hex').slice(0, 16);

const DEGREES   = ['bachelor', 'master', 'phd'];
const SEMESTERS = ['spring', 'fall'];
const YEARS     = ['2025', '2026', '2027', '2028'];

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, whatsapp, qualification, degree,
            major, intake_year, semester, percentage, budget, message, consent } = req.body;

    const errors = {};

    const cleanName = sanitise(name);
    if (!cleanName || cleanName.length < 2) errors.name = 'Please enter your full name (min 2 characters).';

    const cleanEmail = sanitise(email);
    if (!cleanEmail || !validator.isEmail(cleanEmail)) errors.email = 'Please enter a valid email address.';

    const cleanWA = sanitise(whatsapp).replace(/\s/g, '');
    if (!cleanWA || !validator.isMobilePhone(cleanWA, 'any', { strictMode: true })) {
      errors.whatsapp = 'Please enter a valid WhatsApp number with country code (e.g. +919876543210).';
    }

    const cleanQual = sanitise(qualification);
    if (!cleanQual) errors.qualification = 'Please select your current qualification.';

    const cleanDegree = sanitise(degree).toLowerCase();
    if (!DEGREES.includes(cleanDegree)) errors.degree = 'Please select your intended degree.';

    const cleanMajor = sanitise(major);
    if (!cleanMajor || cleanMajor.length < 2) errors.major = 'Please enter your preferred major or field of study.';

    const cleanYear = sanitise(intake_year);
    if (!YEARS.includes(cleanYear)) errors.intake_year = 'Please select a valid intake year.';

    const cleanSem = sanitise(semester).toLowerCase();
    if (!SEMESTERS.includes(cleanSem)) errors.semester = 'Please select Spring or Fall intake.';

    if (!consent || consent === 'false' || consent === false) {
      errors.consent = 'You must provide contact consent to submit this form.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const cleanPct    = sanitise(percentage).slice(0, 10);
    const cleanBudget = sanitise(budget).slice(0, 100);
    const cleanMsg    = sanitise(message).slice(0, 1500);
    const emailLower  = cleanEmail.toLowerCase();
    const ipHash      = hashIp(req.ip);

    // Duplicate guard — same email within 30 minutes
    const recentRows = db.exec(
      `SELECT id FROM enquiries WHERE email = '${emailLower.replace(/'/g,"''")}' AND created_at > datetime('now', '-30 minutes') LIMIT 1`
    );
    if (recentRows.length > 0 && recentRows[0].values.length > 0) {
      return res.status(429).json({
        success: false,
        message: 'A submission from this email was already received recently. Please wait 30 minutes before trying again.'
      });
    }

    db.run(
      `INSERT INTO enquiries
        (name, email, whatsapp, qualification, degree, major, intake_year, semester, percentage, budget, message, consent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [cleanName, emailLower, cleanWA, cleanQual, cleanDegree, cleanMajor,
       cleanYear, cleanSem, cleanPct || null, cleanBudget || null, cleanMsg || null, ipHash]
    );

    const idRows = db.exec('SELECT last_insert_rowid() AS id');
    const newId  = idRows[0]?.values[0]?.[0] ?? null;
    persist();

    // Optional email notification (fire-and-forget)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.ADMIN_EMAIL) {
      try {
        const nodemailer  = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        transporter.sendMail({
          from:    process.env.FROM_EMAIL || process.env.SMTP_USER,
          to:      process.env.ADMIN_EMAIL,
          subject: `[AbroadWings] New Enquiry — ${cleanName}`,
          text: [
            `Name: ${cleanName}`, `Email: ${emailLower}`, `WhatsApp: ${cleanWA}`,
            `Qualification: ${cleanQual}`, `Degree: ${cleanDegree}`, `Major: ${cleanMajor}`,
            `Intake: ${cleanSem} ${cleanYear}`, `Percentage: ${cleanPct || 'N/A'}`,
            `Budget: ${cleanBudget || 'N/A'}`, `Message: ${cleanMsg || 'None'}`, `DB ID: ${newId}`
          ].join('\n')
        }).catch(e => console.error('[Email]', e.message));
      } catch (_) {}
    }

    return res.json({
      success: true,
      id: newId,
      message: "Thank you! Abhishek Sharma & AbroadWings team will contact you for your free 1-on-1 counselling session."
    });

  } catch (err) {
    console.error('[Enquiry] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred. Please try again later or contact us directly on WhatsApp.'
    });
  }
});

module.exports = router;
