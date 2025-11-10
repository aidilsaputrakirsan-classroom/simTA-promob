const express = require('express');
const {
  createTA,
  getTugasAkhir,
  getTAById,
  updateTA,
  deleteTA,
} = require('../controllers/tugasAkhirController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, roleAuth('mahasiswa'), createTA);
router.get('/', auth, getTugasAkhir);
router.get('/:id', auth, getTAById);
router.put('/:id', auth, roleAuth('mahasiswa', 'admin'), updateTA);
router.delete('/:id', auth, roleAuth('admin'), deleteTA);

module.exports = router;