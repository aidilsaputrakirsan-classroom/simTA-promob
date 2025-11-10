const express = require('express');
const {
  uploadProposal,
  getProposals,
  reviewProposal,
  getProposalFileUrl,
  deleteProposal,
} = require('../controllers/proposalController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, roleAuth('mahasiswa'), uploadProposal);
router.get('/', auth, getProposals);
router.get('/:id/file-url', auth, getProposalFileUrl); // Get signed URL for viewing
router.put('/:id/review', auth, roleAuth('dosen'), reviewProposal);
router.delete('/:id', auth, deleteProposal); // Delete proposal

module.exports = router;