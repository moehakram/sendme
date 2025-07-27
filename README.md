# SendMe - Flask File Explorer

**SendMe** adalah aplikasi web file manager berbasis Flask yang memungkinkan Anda untuk mengelola file dan folder melalui antarmuka web yang intuitif. Aplikasi ini sangat berguna untuk berbagi file di jaringan lokal atau mengelola file secara remote.

## Fitur Utama

- **📁 File Browser**: Navigasi folder dengan breadcrumb navigation
- **📤 Upload Multi-file**: Upload beberapa file sekaligus
- **📂 Manajemen Folder**: Buat, hapus, dan rename folder
- **📄 Manajemen File**: View, download, hapus, dan rename file
- **🌐 Cross-platform**: Berjalan di Windows, Linux, dan macOS

## Instalasi

### Download or clone the repository
```bash
git clone https://github.com/moehakram/sendme.git

```

### Instalasi Dependencies
```bash
pip install -r requirements.txt 
```

#### Usage

```bash
# Default: current directory, port 8080
python sendme.py

# Custom root directory
python sendme.py /home/user/documents

# Custom port
python sendme.py -p 3000

# Custom root directory and port
python sendme.py /var/www -p 5000

# Show QR code
python sendme.py --qr

# Show help
python sendme.py --help
```

### Akses Web Interface

Setelah menjalankan aplikasi, buka browser dan akses:
- **Local**: `http://localhost:8080`
- **Network**: Gunakan IP yang ditampilkan di terminal
- **Mobile**: Scan QR code yang ditampilkan

## 🎯 Fitur Web Interface

### 1. File Browser
- **Navigasi Folder**: Klik folder untuk masuk
- **Breadcrumb**: Navigasi cepat ke parent directory
- **File Preview**: Klik file untuk preview/view
- **Sorting**: Folder ditampilkan terlebih dahulu, lalu file (alfabetis)

### 2. Upload File
- **Multi-file Upload**: Pilih beberapa file sekaligus
- **Progress Bar**: Real-time upload progress
- **File Info**: Tampilan jumlah file dan total size
- **Duplicate Handling**: Otomatis rename jika file sudah ada

### 3. Manajemen Folder
- **Buat Folder**: Input nama folder baru
- **Hapus Folder**: Konfirmasi sebelum menghapus
- **Rename Folder**: Edit nama folder inline

### 4. Manajemen File
- **View File**: Preview file di browser
- **Download File**: Download dengan nama original
- **Hapus File**: Konfirmasi sebelum menghapus
- **Rename File**: Edit nama file inline

## 📝 Use Cases

### Development
- **Local Development**: Share files antar tim developer
- **Testing**: Upload test files dengan mudah
- **Asset Management**: Manage project assets

### Production
- **File Sharing**: Share files di jaringan internal
- **Document Management**: Simple document repository
- **Media Server**: Basic media file serving

### Personal
- **Home Network**: Share files antar devices
- **Mobile Access**: Access files dari smartphone
- **Backup Management**: Simple backup file browser

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Gunakan port lain
python sendme.py -p 8081
```

#### Permission Denied
```bash
# Pastikan directory dapat diakses
chmod 755 /path/to/directory
python sendme.py /path/to/directory
```

#### QR Code Error
```bash
# Install qrcode dependencies
pip install qrcode[pil]
```

### Debug Mode
```bash
# Enable debug untuk troubleshooting
python sendme.py --debug
```

## 📄 License

Project ini adalah open source. Silakan digunakan dan dimodifikasi sesuai kebutuhan.

**SendMe** - Simple, Secure, dan User-friendly File Explorer untuk kebutuhan sharing dan management file Anda.