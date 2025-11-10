const express = require('express');
const {
  getAllUsers,
  getDosenList,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, roleAuth('admin'), getAllUsers);
router.get('/dosen', auth, getDosenList);
router.put('/:id', auth, roleAuth('admin'), updateUser);
router.delete('/:id', auth, roleAuth('admin'), deleteUser);

module.exports = router;