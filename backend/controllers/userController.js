const supabase = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let query = supabase
      .from('users')
      .select('id, email, nama, role, nim, nip, created_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dosen list (untuk dropdown)
const getDosenList = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nama, nip, email')
      .eq('role', 'dosen')
      .order('nama');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, role, nim, nip, email } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (nama) updateData.nama = nama;
    if (role) updateData.role = role;
    if (nim) updateData.nim = nim;
    if (nip) updateData.nip = nip;
    if (email) updateData.email = email;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, nama, role, nim, nip')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'User updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Tidak bisa hapus diri sendiri
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getDosenList,
  updateUser,
  deleteUser,
};