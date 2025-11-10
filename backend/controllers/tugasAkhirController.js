const supabase = require('../config/database');

// Mahasiswa: Buat TA baru
const createTA = async (req, res) => {
  try {
    const { judul, deskripsi, dosen_id } = req.body;

    if (!judul) {
      return res.status(400).json({ error: 'Judul required' });
    }

    const { data, error } = await supabase
      .from('tugas_akhir')
      .insert([
        {
          mahasiswa_id: req.user.id,
          dosen_id,
          judul,
          deskripsi,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'TA created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get TA berdasarkan role
const getTugasAkhir = async (req, res) => {
  try {
    let query = supabase
      .from('tugas_akhir')
      .select(`
        *,
        mahasiswa:mahasiswa_id (id, nama, nim, email),
        dosen:dosen_id (id, nama, nip, email)
      `);

    // Filter berdasarkan role
    if (req.user.role === 'mahasiswa') {
      query = query.eq('mahasiswa_id', req.user.id);
    } else if (req.user.role === 'dosen') {
      query = query.eq('dosen_id', req.user.id);
    }
    // Admin bisa lihat semua (no filter)

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get TA by ID
const getTAById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from('tugas_akhir')
      .select(`
        *,
        mahasiswa:mahasiswa_id (id, nama, nim, email),
        dosen:dosen_id (id, nama, nip, email)
      `)
      .eq('id', id);

    // Filter berdasarkan role
    if (req.user.role === 'mahasiswa') {
      query = query.eq('mahasiswa_id', req.user.id);
    } else if (req.user.role === 'dosen') {
      query = query.eq('dosen_id', req.user.id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return res.status(404).json({ error: 'TA not found' });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update TA
const updateTA = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi, dosen_id, status } = req.body;

    // Cek akses
    let query = supabase.from('tugas_akhir').select('*').eq('id', id);

    if (req.user.role === 'mahasiswa') {
      query = query.eq('mahasiswa_id', req.user.id);
    }

    const { data: existingTA } = await query.single();

    if (!existingTA) {
      return res.status(404).json({ error: 'TA not found or access denied' });
    }

    // Update
    const updateData = { updated_at: new Date().toISOString() };
    if (judul) updateData.judul = judul;
    if (deskripsi) updateData.deskripsi = deskripsi;
    if (dosen_id) updateData.dosen_id = dosen_id;
    if (status && req.user.role === 'admin') updateData.status = status;

    const { data, error } = await supabase
      .from('tugas_akhir')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'TA updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete TA (admin only)
const deleteTA = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('tugas_akhir').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'TA deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTA,
  getTugasAkhir,
  getTAById,
  updateTA,
  deleteTA,
};