const supabase = require('../config/database');
const { uploadFile, deleteFile, getSignedUrl } = require('../utils/storage');
const { createNotification } = require('./notificationController');

// Upload proposal (mahasiswa)
const uploadProposal = async (req, res) => {
  try {
    const { tugas_akhir_id, file_name, file_data } = req.body;

    // Validasi input
    if (!tugas_akhir_id || !file_name || !file_data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validasi file adalah PDF
    if (!file_name.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
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

    // Convert base64 to buffer
    const base64Data = file_data.replace(/^data:application\/pdf;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Validasi ukuran file (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (fileBuffer.length > maxSize) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    // Upload file ke Supabase Storage
    const { url: file_url, path: file_path } = await uploadFile(
      fileBuffer,
      file_name
    );

    // Insert proposal ke database
    const { data, error } = await supabase
      .from('proposals')
      .insert([
        {
          tugas_akhir_id,
          file_url,
          file_path, // Store file path for future deletion
          file_name,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      // Jika gagal insert ke database, hapus file yang sudah diupload
      await deleteFile(file_path).catch(console.error);
      return res.status(500).json({ error: error.message });
    }

    // Update status TA menjadi 'diajukan'
    await supabase
      .from('tugas_akhir')
      .update({ status: 'diajukan' })
      .eq('id', tugas_akhir_id);

    res.status(201).json({ message: 'Proposal uploaded successfully', data });
  } catch (error) {
    console.error('Upload proposal error:', error);
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
        tugas_akhir:tugas_akhir_id (
          id,
          judul,
          dosen_id,
          mahasiswa_id
        )
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

    // Create notification for mahasiswa
    const notifTitle = status === 'approved'
      ? '✅ Proposal Disetujui'
      : '❌ Proposal Ditolak';
    const notifMessage = status === 'approved'
      ? `Proposal Anda untuk TA "${proposal.tugas_akhir.judul}" telah disetujui oleh dosen pembimbing.`
      : `Proposal Anda untuk TA "${proposal.tugas_akhir.judul}" ditolak. ${catatan ? 'Catatan: ' + catatan : 'Silakan perbaiki dan upload kembali.'}`;

    await createNotification(
      proposal.tugas_akhir.mahasiswa_id,
      notifTitle,
      notifMessage,
      'proposal_reviewed',
      {
        proposal_id: id,
        tugas_akhir_id: proposal.tugas_akhir_id,
        status,
      }
    );

    res.json({ message: 'Proposal reviewed', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get proposal file URL (signed URL for secure access)
const getProposalFileUrl = async (req, res) => {
  try {
    const { id } = req.params;

    // Get proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select(`
        *,
        tugas_akhir:tugas_akhir_id (
          mahasiswa_id,
          dosen_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check authorization
    const { mahasiswa_id, dosen_id } = proposal.tugas_akhir;
    const isAuthorized =
      req.user.role === 'admin' ||
      req.user.id === mahasiswa_id ||
      req.user.id === dosen_id;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get signed URL (valid for 1 hour)
    const signedUrl = await getSignedUrl(proposal.file_path, 'proposals', 3600);

    res.json({
      file_url: signedUrl,
      file_name: proposal.file_name,
    });
  } catch (error) {
    console.error('Get proposal file URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete proposal (mahasiswa or admin)
const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;

    // Get proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select(`
        *,
        tugas_akhir:tugas_akhir_id (
          mahasiswa_id,
          id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check authorization (only mahasiswa owner or admin can delete)
    const isMahasiswaOwner = proposal.tugas_akhir.mahasiswa_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isMahasiswaOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from storage
    await deleteFile(proposal.file_path);

    // Delete proposal from database
    const { error: deleteError } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }

    // Check if there are other proposals for this TA
    const { data: otherProposals } = await supabase
      .from('proposals')
      .select('id')
      .eq('tugas_akhir_id', proposal.tugas_akhir_id);

    // If no more proposals, revert TA status to draft
    if (!otherProposals || otherProposals.length === 0) {
      await supabase
        .from('tugas_akhir')
        .update({ status: 'draft' })
        .eq('id', proposal.tugas_akhir_id);
    }

    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadProposal,
  getProposals,
  reviewProposal,
  getProposalFileUrl,
  deleteProposal,
};