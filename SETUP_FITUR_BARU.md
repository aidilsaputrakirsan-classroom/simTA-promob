# 📚 Setup Guide - 3 Fitur Prioritas Tinggi

Dokumentasi untuk setup dan implementasi 3 fitur baru:
1. **File Storage** (Supabase Storage)
2. **Document Viewer** (PDF Viewer)
3. **Notifications System** (In-app Notifications)

---

## 🗄️ 1. SETUP SUPABASE STORAGE

### A. Setup Bucket di Supabase Dashboard

1. **Login ke Supabase Dashboard**
   - Buka: https://app.supabase.com
   - Pilih project Anda (simTA)

2. **Buat Storage Bucket**
   - Klik menu **Storage** di sidebar kiri
   - Klik tombol **New bucket**
   - Isi form:
     - **Name**: `proposals` (nama bucket untuk proposal files)
     - **Public bucket**: **UNCHECK** (jangan centang, biar file private)
     - **File size limit**: `10 MB` (batas ukuran file)
     - **Allowed MIME types**: `application/pdf` (hanya PDF)
   - Klik **Create bucket**

3. **Setup Bucket Policies (RLS - Row Level Security)**

   Setelah bucket dibuat, klik bucket `proposals` → tab **Policies** → **New Policy**

   **Policy 1: Allow Upload (Mahasiswa can upload)**
   ```sql
   -- Policy Name: Allow mahasiswa to upload
   CREATE POLICY "Allow mahasiswa to upload proposals"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'proposals' AND
     (auth.jwt() ->> 'role')::text = 'mahasiswa'
   );
   ```

   **Policy 2: Allow Read (Mahasiswa, Dosen, Admin can read)**
   ```sql
   -- Policy Name: Allow authenticated users to read
   CREATE POLICY "Allow authenticated to read proposals"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'proposals');
   ```

   **Policy 3: Allow Delete (Only uploader or admin)**
   ```sql
   -- Policy Name: Allow delete own files
   CREATE POLICY "Allow users to delete own proposals"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'proposals' AND
     (auth.uid() = owner OR (auth.jwt() ->> 'role')::text = 'admin')
   );
   ```

   **CATATAN**: Karena kita pakai custom JWT (bukan Supabase Auth), kita perlu adjust policy atau handle authorization di backend. Untuk simplicity, kita akan handle authorization di backend saja.

### B. Update Environment Variables

File `.env` di backend sudah ada, pastikan ada variabel ini:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-or-service-role-key
JWT_SECRET=your-jwt-secret
PORT=5000
```

**PENTING**: Untuk upload file, gunakan **Service Role Key** (bukan anon key) karena punya akses penuh ke storage.

Cara dapat Service Role Key:
1. Dashboard Supabase → **Settings** → **API**
2. Copy **service_role** key (secret key)
3. Update `SUPABASE_KEY` di `.env` dengan service_role key

**Jangan lupa update di Vercel juga!**

---

## 📱 2. SETUP DOCUMENT VIEWER

### Install Dependencies (Mobile)

```bash
cd mobile
npx expo install react-native-pdf
npx expo install react-native-blob-util
```

**Catatan**:
- `react-native-pdf` untuk render PDF
- `react-native-blob-util` untuk download & cache file

### Update app.json (Permissions)

Tambahkan permission untuk read/write files:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-document-picker",
        {
          "iCloudContainerEnvironment": "Production"
        }
      ]
    ],
    "android": {
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "This app needs access to save PDFs",
        "NSCameraUsageDescription": "This app needs camera access"
      }
    }
  }
}
```

---

## 🔔 3. SETUP NOTIFICATIONS SYSTEM

### A. Buat Table Notifications di Supabase

1. **Buka SQL Editor** di Supabase Dashboard
2. **Run SQL berikut** untuk create table:

```sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'proposal_reviewed', 'ta_status_changed', etc
  data JSONB, -- Additional data (proposal_id, ta_id, etc)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policy: System can insert notifications (handled by backend)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
```

3. **Verifikasi** table sudah dibuat:
   - Buka **Table Editor** → cek ada table `notifications`

### B. Install Expo Notifications (Optional - untuk Push Notifications nanti)

```bash
cd mobile
npx expo install expo-notifications
npx expo install expo-device
```

**Catatan**: Untuk fase 1, kita buat in-app notifications dulu. Push notifications bisa ditambah nanti.

---

## ✅ CHECKLIST SETUP

Sebelum testing, pastikan semua ini sudah di-setup:

### Backend:
- [ ] Supabase Storage bucket `proposals` sudah dibuat
- [ ] Environment variable `SUPABASE_KEY` menggunakan **service_role** key
- [ ] Table `notifications` sudah dibuat di Supabase

### Mobile:
- [ ] Dependencies `react-native-pdf` dan `react-native-blob-util` terinstall
- [ ] `expo-notifications` terinstall (optional untuk fase 2)
- [ ] Rebuild app: `npx expo start --clear` (clear cache)

### Vercel:
- [ ] Environment variables di Vercel sudah updated (jika pakai service_role key)

---

## 🧪 CARA TESTING

### Test 1: File Upload
1. Login sebagai Mahasiswa
2. Buat TA baru atau pilih TA existing
3. Klik "Upload Proposal"
4. Pilih file PDF (max 10MB)
5. Klik Upload → file akan upload ke Supabase Storage
6. Cek di Supabase Dashboard → Storage → proposals bucket → file harus ada

### Test 2: Document Viewer
1. Di detail TA, klik proposal yang sudah di-upload
2. PDF viewer akan muncul dan load file
3. Test zoom, scroll, pagination

### Test 3: Notifications
1. Login sebagai Dosen
2. Review proposal mahasiswa (approve/reject)
3. Logout, login sebagai Mahasiswa yang tadi
4. Klik icon notifikasi → harus muncul notif "Proposal di-review"
5. Klik notif → mark as read, badge berkurang

---

## 🐛 TROUBLESHOOTING

### Error: "Storage bucket not found"
- **Solusi**: Pastikan bucket `proposals` sudah dibuat di Supabase Dashboard

### Error: "Unauthorized" saat upload
- **Solusi**: Pastikan `SUPABASE_KEY` menggunakan **service_role** key, bukan anon key

### Error: "Failed to load PDF"
- **Solusi**:
  1. Cek URL file di database (harus format: `https://[project].supabase.co/storage/v1/object/public/proposals/...`)
  2. Clear cache: `npx expo start --clear`
  3. Rebuild app

### Notifications tidak muncul
- **Solusi**:
  1. Cek table `notifications` ada data
  2. Cek `user_id` di notification sesuai dengan user yang login
  3. Refresh screen

---

## 📞 SUPPORT

Jika ada error atau pertanyaan, hubungi tim development atau buat issue di repository.

---

**Dibuat**: 2025-11-10
**Untuk**: SIMTA Mobile App
**Versi**: 1.0
