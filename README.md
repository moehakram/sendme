# SendMe - Flask File Explorer

**SendMe** adalah aplikasi web file manager berbasis Flask yang memungkinkan Anda untuk mengelola file dan folder melalui antarmuka web yang intuitif. Aplikasi ini sangat berguna untuk berbagi file di jaringan lokal atau mengelola file secara remote.

## ✨ Fitur Utama

- **📁 File Browser**: Navigasi folder dengan breadcrumb navigation
- **📤 Upload Multi-file**: Upload beberapa file sekaligus dengan progress bar
- **📂 Manajemen Folder**: Buat, hapus, dan rename folder
- **📄 Manajemen File**: View, download, hapus, dan rename file
- **🌐 Cross-platform**: Berjalan di Windows, Linux, dan macOS

## 🚀 Instalasi

### Requirements
- Python 3.6+
- Flask
- qrcode (untuk QR code generation)

### Instalasi Dependencies
```bash
pip install -r requirements.txt 
```

### Download dan Jalankan
```bash
# Download atau copy file sendme.py

## 📖 Cara Penggunaan

### Command Line Arguments

#### Sintaks Dasar
```bash
python sendme.py [OPTIONS]
```

#### Opsi yang Tersedia

| Opsi | Shorthand | Default | Deskripsi |
|------|-----------|---------|-----------|
| `--root` | `-r` | `uploads` | Root directory untuk file explorer |
| `--port` | `-p` | `8080` | Port untuk server |
| `--host` |  | `0.0.0.0` | Host interface |
| `--no-qr` |  | `False` | Jangan tampilkan QR code |
| `--debug` |  | `False` | Enable debug mode |
| `--help` | `-h` |  | Dokumentasi atau petunjuk penggunaan |

#### Contoh Penggunaan

```bash
# Default: folder uploads, port 8080
python sendme.py

# Custom root directory
python sendme.py -r /home/user/documents

# Custom port
python sendme.py -p 3000

# Custom root dan port
python sendme.py -r /var/www -p 5000

# Tanpa QR code
python sendme.py --no-qr

# Debug mode
python sendme.py --debug

# Kombinasi opsi
python sendme.py -r /tmp -p 8080 --no-qr
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

## 🔧 API Endpoints

### File Operations
- `GET /` - Root directory listing
- `GET /<path:subpath>` - Directory/file browsing
- `/view/<path:subpath>` - File preview
- `/download/<path:subpath>` - File download

### Upload & Management
- `POST /upload/<path:subpath>` - Upload files
- `POST /mkdir/<path:subpath>` - Create folder
- `POST /delete/<path:subpath>` - Delete file/folder
- `POST /rename/<path:subpath>` - Rename file/folder

## 🛡️ Keamanan

### Path Traversal Protection
Aplikasi menggunakan fungsi `safe_join()` untuk mencegah directory traversal attacks:
```python
def safe_join(base, *paths):
    full_path = os.path.abspath(os.path.join(base, *paths))
    if not full_path.startswith(os.path.abspath(base)):
        abort(403)
    return full_path
```

### Secure Filename Handling
- Menggunakan `secure_filename()` dari Werkzeug
- Mencegah karakter berbahaya dalam nama file
- Automatic duplicate handling

## 🌐 Network Configuration

### Local IP Detection
Aplikasi otomatis mendeteksi IP lokal untuk akses network:
```python
def get_local_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('8.8.8.8', 80))
            return s.getsockname()[0]
    except Exception:
        return socket.gethostbyname(socket.gethostname())
```

### QR Code Generation
QR code ASCII otomatis generate untuk akses mobile yang mudah.

## 🎨 Customization

### HTML Template
Template HTML tersimpan dalam variabel `HTML_TEMPLATE` yang dapat dimodifikasi untuk:
- Custom styling
- Additional features
- Branding

### CSS Styling
Built-in CSS dengan tema modern:
- Responsive design
- Progress animations
- Button styling
- Clean typography

## 🚨 Error Handling

### Permission Errors
- Check directory permissions saat startup
- Graceful handling untuk read/write errors
- User-friendly error messages

### File Operations
- Duplicate filename handling
- Invalid filename sanitization
- Missing file/directory handling

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
python sendme.py -r /path/to/directory
```

#### QR Code Error
```bash
# Install qrcode dependencies
pip install qrcode[pil]

# Atau disable QR code
python sendme.py --no-qr
```

### Debug Mode
```bash
# Enable debug untuk troubleshooting
python sendme.py --debug
```

## 📄 License

Project ini adalah open source. Silakan digunakan dan dimodifikasi sesuai kebutuhan.

**SendMe** - Simple, Secure, dan User-friendly File Explorer untuk kebutuhan sharing dan management file Anda.