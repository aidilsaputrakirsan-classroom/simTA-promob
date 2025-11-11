# 📦 Install Dependencies untuk Fitur Baru

Sebelum testing aplikasi, install dependencies baru yang diperlukan.

## Backend

Tidak ada dependencies baru untuk backend. Semua sudah tersedia.

## Mobile

Install dependencies berikut di folder `mobile`:

```bash
cd mobile

# Install react-native-pdf untuk PDF viewer
npm install react-native-pdf

# Install react-native-blob-util (dependency untuk PDF)
npm install react-native-blob-util

# Clear cache dan rebuild
npx expo start --clear
```

### Alternatif dengan Expo CLI

Jika menggunakan Expo managed workflow:

```bash
cd mobile

npx expo install react-native-pdf react-native-blob-util

# Clear cache
npx expo start --clear
```

## Verifikasi Installation

Setelah install, cek `package.json` harus ada:

```json
{
  "dependencies": {
    ...
    "react-native-pdf": "^x.x.x",
    "react-native-blob-util": "^x.x.x",
    ...
  }
}
```

## Troubleshooting

### Error: "react-native-pdf not found"
**Solusi**: Pastikan sudah install dan rebuild app
```bash
npm install react-native-pdf react-native-blob-util
npx expo start --clear
```

### Error: "Unable to resolve module"
**Solusi**: Clear cache dan reinstall
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Error pada iOS build
**Solusi**: Install pods (jika menggunakan bare workflow)
```bash
cd ios
pod install
cd ..
npx expo start --clear
```

## Next Steps

Setelah install dependencies:

1. **Run Database Migration**: Execute `database_migration.sql` di Supabase
2. **Setup Supabase Storage**: Ikuti panduan di `SETUP_FITUR_BARU.md`
3. **Update Environment Variables**: Pastikan `SUPABASE_KEY` menggunakan service_role key
4. **Start Development**: `npx expo start`

---

**Catatan**: Dependencies ini hanya perlu diinstall sekali. Setelah itu, commit `package.json` dan `package-lock.json` agar tim lain bisa `npm install` saja.
