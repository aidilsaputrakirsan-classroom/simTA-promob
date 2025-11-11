# 📦 Install Dependencies untuk Fitur Baru

Sebelum testing aplikasi, install dependencies baru yang diperlukan.

## Backend

Tidak ada dependencies baru untuk backend. Semua sudah tersedia.

## Mobile

Install dependencies berikut di folder `mobile`:

```bash
cd mobile

# Install react-native-webview untuk PDF viewer (Expo Go compatible!)
npx expo install react-native-webview

# Clear cache dan rebuild
npx expo start --clear
```

### ✅ Expo Go Compatible!

Aplikasi ini sekarang **100% compatible dengan Expo Go**! Anda tidak perlu development build atau EAS Build.

**Document Viewer** menggunakan **WebView dengan Google Docs Viewer** untuk menampilkan PDF. Ini bekerja di:
- ✅ Expo Go (iOS & Android)
- ✅ Web
- ✅ Production builds

## Verifikasi Installation

Setelah install, cek `package.json` harus ada:

```json
{
  "dependencies": {
    ...
    "react-native-webview": "14.2.5",
    ...
  }
}
```

## Troubleshooting

### Error: "react-native-webview not found"
**Solusi**: Install ulang
```bash
cd mobile
npx expo install react-native-webview
npx expo start --clear
```

### Error: "Unable to resolve module"
**Solusi**: Clear cache dan reinstall
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### PDF tidak muncul di viewer
**Solusi**:
1. Pastikan file sudah terupload ke Supabase Storage
2. Pastikan URL file bisa diakses (cek di browser)
3. Pastikan koneksi internet stabil (Google Docs Viewer perlu internet)
4. Coba clear cache: `npx expo start --clear`

### WebView blank/kosong
**Solusi**:
1. Cek console log untuk error
2. Pastikan file_url dari backend valid
3. Test buka URL di browser dulu
4. Pastikan file adalah PDF yang valid

## Next Steps

Setelah install dependencies:

1. **Run Database Migration**: Execute `database_migration.sql` di Supabase
2. **Setup Supabase Storage**: Ikuti panduan di `SETUP_FITUR_BARU.md`
3. **Update Environment Variables**: Pastikan `SUPABASE_KEY` menggunakan service_role key
4. **Start Development**: `npx expo start`

---

## 📝 Catatan Penting

### Kenapa Pakai WebView + Google Docs Viewer?

Kami menggunakan WebView dengan Google Docs Viewer karena:

✅ **Expo Go Compatible** - Tidak perlu development build
✅ **Cross-platform** - Work di iOS, Android, dan Web
✅ **Zero Config** - Tidak perlu setup native modules
✅ **Fast Development** - Langsung test di Expo Go

**Limitasi:**
- ⚠️ Perlu koneksi internet untuk load PDF
- ⚠️ Performa sedikit lebih lambat dibanding native PDF viewer
- ⚠️ Tergantung pada Google Docs Viewer service

### Mau Upgrade ke Native PDF Viewer?

Jika nanti ingin upgrade ke native PDF viewer (lebih cepat, offline support), ikuti langkah ini:

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login ke Expo
eas login

# Build development client
eas build --profile development --platform android  # atau ios

# Ganti DocumentViewerScreen dengan react-native-pdf
npm install react-native-pdf react-native-blob-util
```

Tapi untuk development dan testing, **WebView sudah cukup**! 🚀

---

**Catatan**: Dependencies ini hanya perlu diinstall sekali. Setelah itu, commit `package.json` agar tim lain bisa `npm install` saja.
