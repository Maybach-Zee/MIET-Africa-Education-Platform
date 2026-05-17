const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, p.province_name, c.centre_name
       FROM donations d
       LEFT JOIN provinces p ON d.province_id = p.province_id
       LEFT JOIN centres c ON d.centre_id = c.centre_id
       ORDER BY d.donation_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { donor_name, donor_organisation, donor_email, amount, purpose, centre_id, payment_method } = req.body;
  const receipt_number = 'RCP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    const { rows: [donation] } = await pool.query(
      `INSERT INTO donations (donor_name, donor_organisation, donor_email, amount, purpose, centre_id, payment_method, receipt_number, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [donor_name, donor_organisation, donor_email, amount, purpose, centre_id, payment_method, receipt_number, req.user.id]
    );
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'CREATE',
      entityType: 'donations', entityId: donation.donation_id,
      description: 'Donation recorded', actionResult: 'SUCCESS'
    });
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public-facing donation (no auth)
exports.publicDonate = async (req, res) => {
  const { donor_name, donor_email, amount, purpose, centre_id } = req.body;
  const receipt_number = 'RCP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    await pool.query(
      `INSERT INTO donations (donor_name, donor_email, amount, purpose, centre_id, payment_method, receipt_number, payment_status)
       VALUES ($1,$2,$3,$4,$5,'CARD',$6,'PENDING')`,
      [donor_name, donor_email, amount, purpose, centre_id || null, receipt_number]
    );
    res.status(201).json({ message: 'Donation recorded', receipt_number });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public impact stats
exports.publicImpact = async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM learners WHERE status = 'ACTIVE') AS total_learners,
        (SELECT COUNT(*) FROM certificates WHERE status = 'ISSUED') AS total_certificates,
        (SELECT COUNT(*) FROM centres WHERE is_active = true) AS total_schools,
        (SELECT COUNT(*) FROM users WHERE role = 'FACILITATOR' AND is_active = true) AS total_teachers
    `);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: process a donation (approve/waive/refund)
exports.processDonation = async (req, res) => {
  const { id } = req.params;
  const { payment_status, notes } = req.body;
  try {
    await pool.query(
      'UPDATE donations SET payment_status=$1, notes=$2 WHERE donation_id=$3',
      [payment_status, notes, id]
    );
    await logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'UPDATE',
      entityType: 'donations',
      entityId: id,
      description: `Donation marked as ${payment_status}`,
      actionResult: 'SUCCESS'
    });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};