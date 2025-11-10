const supabase = require('../config/database');

// Upload proposal (mahasiswa)
const uploadProposal = async (req, res) => {
  try {
    const { tugas_akhir_id, file_url, file_name } = req.body;

    if (!tugas_akhir_id || !file_url || !file_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Cek TA milik mahasiswa
    const { data: ta } = await supabase
      .from('tugas_akhir')
      .select('*')
      .eq('id', tugas_akhir_id)
      .eq('mahasiswa_id', req.user.id)
      .single();

    if (!ta) {
      return res.status(404).json({ error: 'TA not found or access denied' });
    }

    // Insert proposal
    const { data, error } = await supabase
      .from('proposals')
      .insert([
        {
          tugas_akhir_id,
          file_url,
          file_name,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Update status TA
    await supabase
      .from('tugas_akhir')
      .update({ status: 'diajukan' })
      .eq('id', tugas_akhir_id);

    res.status(201).json({ message: 'Proposal uploaded', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get proposals
const getProposals = async (req, res) => {
  try {
    const { tugas_akhir_id } = req.query;

    let query = supabase
      .from('proposals')
      .select(`
        *,
        tugas_akhir:tugas_akhir_id (
          id, judul,
          mahasiswa:mahasiswa_id (id, nama, nim)
        ),
        reviewer:reviewed_by (id, nama)
      `);

    if (tugas_akhir_id) {
      query = query.eq('tugas_akhir_id', tugas_akhir_id);
    }

    // Filter berdasarkan role
    if (req.user.role === 'mahasiswa') {
      query = query.eq('tugas_akhir.mahasiswa_id', req.user.id);
    } else if (req.user.role === 'dosen') {
      query = query.eq('tugas_akhir.dosen_id', req.user.id);
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Review proposal (dosen)
const reviewProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Cek proposal milik dosen pembimbing
    const { data: proposal } = await supabase
      .from('proposals')
      .select(`
        *,
        tugas_akhir:tugas_akhir_id (dosen_id)
      `)
      .eq('id', id)
      .single();

    if (!proposal || proposal.tugas_akhir.dosen_id !== req.user.id) {
      return res.status(404).json({ error: 'Proposal not found or access denied' });
    }

    // Update proposal
    const { data, error } = await supabase
      .from('proposals')
      .update({
        status,
        catatan,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Update status TA
    const taStatus = status === 'approved' ? 'disetujui' : 'ditolak';
    await supabase
      .from('tugas_akhir')
      .update({ status: taStatus })
      .eq('id', proposal.tugas_akhir_id);

    res.json({ message: 'Proposal reviewed', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadProposal,
  getProposals,
  reviewProposal,
};