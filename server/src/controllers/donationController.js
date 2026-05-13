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
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  const { donor_name, donor_organisation, donor_email, amount, purpose, centre_id, province_id, payment_method } = req.body;
  try {
    const receipt_number = 'RCP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const { rows: [donation] } = await pool.query(
      `INSERT INTO donations (donor_name, donor_organisation, donor_email, amount, purpose, centre_id, province_id, payment_method, receipt_number, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [donor_name, donor_organisation, donor_email, amount, purpose, centre_id, province_id, payment_method, receipt_number, req.user.id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'CREATE', entityType: 'donations', entityId: donation.donation_id, description: 'Donation recorded', actionResult: 'SUCCESS' });
    res.status(201).json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};