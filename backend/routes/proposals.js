const express = require('express');
const {
  uploadProposal,
  getProposals,
  reviewProposal,
} = require('../controllers/proposalController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, roleAuth('mahasiswa'), uploadProposal);
router.get('/', auth, getProposals);
router.put('/:id/review', auth, roleAuth('dosen'), reviewProposal);

module.exports = router;