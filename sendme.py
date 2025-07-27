from flask import Flask, request, send_from_directory, render_template_string, redirect, url_for, abort, jsonify
import os
import shutil
import argparse
from datetime import datetime
from werkzeug.utils import secure_filename
import socket
import qrcode

app = Flask(__name__)

# Global variable untuk ROOT_DIR yang akan diset dari argparse
ROOT_DIR = '.'

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>File Explorer - {{ root_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .root-info { background: #e7f3ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; color: #0066cc; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f4f4f4; }
        .progress-container { margin: 20px 0; }
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            display: none;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 10px;
        }
        .progress-text { text-align: center; margin-top: 10px; display: none; }
        .upload-section, .folder-section { 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 10px 0; 
        }
        .btn { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 8px 12px; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #218838; }
        .file-input { margin: 10px 0; }
        .form-inline { display: inline-block; margin: 0 5px; }
        .small-input { width: 100px; padding: 5px; }
        .upload-info { color: #666; font-size: 0.9em; margin-top: 10px; }
        .breadcrumb { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0; 
            font-size: 0.9em;
        }
        .breadcrumb a { color: #007bff; text-decoration: none; }
        .breadcrumb a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📁 File Explorer</h1>
        <div class="root-info">
            <strong>Root Directory:</strong> {{ root_path }}<br>
            <strong>Current Path:</strong> /{{ subpath }}
        </div>
    </div>
    
    {% if breadcrumbs %}
    <div class="breadcrumb">
        <strong>📍 Path:</strong> 
        {% for crumb in breadcrumbs %}
            {% if not loop.last %}
                <a href="{{ crumb.url }}">{{ crumb.name }}</a> /
            {% else %}
                <strong>{{ crumb.name }}</strong>
            {% endif %}
        {% endfor %}
    </div>
    {% endif %}
    
    <div class="upload-section">
        <h3>📤 Upload File</h3>
        <form id="uploadForm" method="post" enctype="multipart/form-data" action="{{ url_for('upload_files', subpath=subpath) }}">
            <div class="file-input">
                <input type="file" name="files" id="fileInput" multiple>
                <button type="submit" class="btn">Upload</button>
            </div>
            <div class="upload-info" id="fileInfo"></div>
        </form>
        
        <div class="progress-container">
            <div class="progress-bar" id="progressBar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">0%</div>
        </div>
    </div>
    
    <div class="folder-section">
        <h3>📂 Buat Folder Baru</h3>
        <form method="post" action="{{ url_for('create_folder', subpath=subpath) }}">
            <input type="text" name="foldername" placeholder="Nama Folder" required>
            <button type="submit" class="btn">Buat Folder</button>
        </form>
    </div>
    
    <hr>
    
    {% if parent_link %}
        <p><a href="{{ parent_link }}" class="btn">⬅️ Kembali ke atas</a></p>
    {% endif %}
    
    <table>
        <thead>
            <tr>
                <th>Nama</th>
                <th>Ukuran</th>
                <th>Terakhir Diubah</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
            {% if items %}
                {% for item in items %}
                    <tr>
                        <td>
                            {% if item.is_dir %}
                                📁 <a href="{{ url_for('index', subpath=item.rel_path) }}">{{ item.name }}/</a>
                            {% else %}
                                📄 <a href="{{ url_for('view_file', subpath=item.rel_path) }}">{{ item.name }}</a>
                            {% endif %}
                        </td>
                        <td>{{ item.size if not item.is_dir else '-' }}</td>
                        <td>{{ item.modified }}</td>
                        <td>
                            <form method="post" action="{{ url_for('delete_item', subpath=item.rel_path) }}" class="form-inline">
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Yakin hapus {{ item.name }}?')">🗑️</button>
                            </form>
                            <form method="post" action="{{ url_for('rename_item', subpath=item.rel_path) }}" class="form-inline">
                                <input type="text" name="new_name" placeholder="Nama baru" class="small-input" required>
                                <button type="submit" class="btn">✏️</button>
                            </form>
                            {% if not item.is_dir %}
                                <a href="{{ url_for('download_file', subpath=item.rel_path) }}" class="btn btn-success">💾</a>
                            {% endif %}
                        </td>
                    </tr>
                {% endfor %}
            {% else %}
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; font-style: italic;">
                        Folder kosong
                    </td>
                </tr>
            {% endif %}
        </tbody>
    </table>
    
    <script>
        // Format file size display
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        // Display selected files info
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const files = e.target.files;
            const fileInfo = document.getElementById('fileInfo');
            
            if (files.length > 0) {
                let totalSize = 0;
                let fileNames = [];
                
                for (let i = 0; i < files.length; i++) {
                    totalSize += files[i].size;
                    fileNames.push(files[i].name);
                }
                
                fileInfo.innerHTML = `
                    <strong>File terpilih:</strong> ${files.length} file(s)<br>
                    <strong>Total ukuran:</strong> ${formatFileSize(totalSize)}<br>
                    <strong>File:</strong> ${fileNames.slice(0, 3).join(', ')}${files.length > 3 ? ' dan ' + (files.length - 3) + ' file lainnya' : ''}
                `;
            } else {
                fileInfo.innerHTML = '';
            }
        });
        
        // Handle form submission with progress
        document.getElementById('uploadForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const files = document.getElementById('fileInput').files;
            
            if (files.length === 0) {
                alert('Pilih file terlebih dahulu!');
                return;
            }
            
            // Show progress bar
            const progressBar = document.getElementById('progressBar');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            
            progressBar.style.display = 'block';
            progressText.style.display = 'block';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            
            // Create XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', function(e) {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    progressFill.style.width = percentComplete + '%';
                    progressText.textContent = percentComplete + '%';
                }
            });
            
            xhr.addEventListener('load', function() {
                if (xhr.status === 200) {
                    progressText.textContent = 'Upload selesai! Mengalihkan...';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    progressText.textContent = 'Upload gagal!';
                    progressFill.style.backgroundColor = '#dc3545';
                }
            });
            
            xhr.addEventListener('error', function() {
                progressText.textContent = 'Terjadi kesalahan saat upload!';
                progressFill.style.backgroundColor = '#dc3545';
            });
            
            xhr.open('POST', this.action);
            xhr.send(formData);
        });
    </script>
</body>
</html>
'''

def format_file_size(size_bytes):
    """Convert bytes to human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    size = float(size_bytes)
    
    while size >= 1024.0 and i < len(size_names) - 1:
        size /= 1024.0
        i += 1
    
    if i == 0:  # Bytes
        return f"{int(size)} {size_names[i]}"
    elif size >= 100:  # >= 100 units, no decimal
        return f"{size:.0f} {size_names[i]}"
    elif size >= 10:   # >= 10 units, 1 decimal
        return f"{size:.1f} {size_names[i]}"
    else:              # < 10 units, 2 decimals
        return f"{size:.2f} {size_names[i]}"

def safe_join(base, *paths):
    """Safely join paths and prevent directory traversal attacks"""
    full_path = os.path.abspath(os.path.join(base, *paths))
    if not full_path.startswith(os.path.abspath(base)):
        abort(403)
    return full_path

def generate_breadcrumbs(subpath):
    """Generate breadcrumb navigation"""
    breadcrumbs = []
    
    # Root breadcrumb
    breadcrumbs.append({
        'name': '🏠 Root',
        'url': url_for('index', subpath='')
    })
    
    if subpath:
        parts = subpath.split('/')
        current_path = ''
        
        for part in parts:
            if part:  # Skip empty parts
                current_path = os.path.join(current_path, part) if current_path else part
                breadcrumbs.append({
                    'name': part,
                    'url': url_for('index', subpath=current_path)
                })
    
    return breadcrumbs

@app.route('/', defaults={'subpath': ''})
@app.route('/<path:subpath>')
def index(subpath):
    full_path = safe_join(ROOT_DIR, subpath)
    
    # If path doesn't exist, redirect to root
    if not os.path.exists(full_path):
        return redirect(url_for('index', subpath=''))
    
    # If it's a file, view it directly
    if not os.path.isdir(full_path):
        return redirect(url_for('view_file', subpath=subpath))
    
    items = []
    try:
        for name in os.listdir(full_path):
            item_path = os.path.join(full_path, name)
            stat = os.stat(item_path)
            is_dir = os.path.isdir(item_path)
            
            rel_path = os.path.join(subpath, name) if subpath else name
            
            items.append({
                'name': name,
                'rel_path': rel_path,
                'is_dir': is_dir,
                'size': format_file_size(stat.st_size) if not is_dir else '',
                'size_bytes': stat.st_size if not is_dir else 0,
                'modified': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
            })
    except PermissionError:
        items = []
    
    # Sort: directories first, then files by name
    items.sort(key=lambda x: (not x['is_dir'], x['name'].lower()))
    
    parent_link = None
    if subpath:
        parent = os.path.dirname(subpath)
        parent_link = url_for('index', subpath=parent)
    
    breadcrumbs = generate_breadcrumbs(subpath)
    
    return render_template_string(HTML_TEMPLATE,
                                  subpath=subpath,
                                  parent_link=parent_link,
                                  items=items,
                                  root_path=os.path.abspath(ROOT_DIR),
                                  root_name=os.path.basename(ROOT_DIR),
                                  breadcrumbs=breadcrumbs)

@app.route('/upload', defaults={'subpath': ''}, methods=['POST'])
@app.route('/upload/<path:subpath>', methods=['POST'])
def upload_files(subpath):
    folder = safe_join(ROOT_DIR, subpath)
    os.makedirs(folder, exist_ok=True)
    
    files = request.files.getlist('files')
    uploaded_count = 0
    
    for f in files:
        if f.filename:
            # Secure the filename
            filename = secure_filename(f.filename)
            if filename:  # Check if filename is not empty after securing
                filepath = os.path.join(folder, filename)
                
                # Handle duplicate filenames
                counter = 1
                original_filepath = filepath
                while os.path.exists(filepath):
                    name, ext = os.path.splitext(original_filepath)
                    filepath = f"{name}({counter}){ext}"
                    counter += 1
                
                f.save(filepath)
                uploaded_count += 1
    
    return redirect(url_for('index', subpath=subpath))

@app.route('/mkdir', defaults={'subpath': ''}, methods=['POST'])
@app.route('/mkdir/<path:subpath>', methods=['POST'])
def create_folder(subpath):
    foldername = request.form.get('foldername')
    if not foldername:
        return "Nama folder tidak boleh kosong", 400
    
    # Secure folder name
    foldername = secure_filename(foldername)
    if not foldername:
        return "Nama folder tidak valid", 400
    
    new_folder = safe_join(ROOT_DIR, os.path.join(subpath, foldername))
    os.makedirs(new_folder, exist_ok=True)
    return redirect(url_for('index', subpath=subpath))

@app.route('/delete/<path:subpath>', methods=['POST'])
def delete_item(subpath):
    path = safe_join(ROOT_DIR, subpath)
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
        elif os.path.isfile(path):
            os.remove(path)
    except (OSError, PermissionError) as e:
        return f"Error menghapus: {str(e)}", 500
    
    return redirect(url_for('index', subpath=os.path.dirname(subpath)))

@app.route('/rename/<path:subpath>', methods=['POST'])
def rename_item(subpath):
    path = safe_join(ROOT_DIR, subpath)
    new_name = request.form.get('new_name')
    if not new_name:
        return "Nama baru tidak boleh kosong", 400
    
    # Secure new name
    new_name = secure_filename(new_name)
    if not new_name:
        return "Nama baru tidak valid", 400
    
    new_path = safe_join(ROOT_DIR, os.path.join(os.path.dirname(subpath), new_name))
    
    # Check if new name already exists
    if os.path.exists(new_path):
        return "File/folder dengan nama tersebut sudah ada", 400
    
    try:
        os.rename(path, new_path)
    except (OSError, PermissionError) as e:
        return f"Error mengubah nama: {str(e)}", 500
    
    return redirect(url_for('index', subpath=os.path.dirname(subpath)))

@app.route('/view/<path:subpath>')
def view_file(subpath):
    folder = os.path.dirname(subpath)
    filename = os.path.basename(subpath)
    directory = safe_join(ROOT_DIR, folder)
    
    file_path = os.path.join(directory, filename)
    if not os.path.exists(file_path):
        abort(404)
    
    return send_from_directory(directory, filename, as_attachment=False)

@app.route('/download/<path:subpath>')
def download_file(subpath):
    folder = os.path.dirname(subpath)
    filename = os.path.basename(subpath)
    directory = safe_join(ROOT_DIR, folder)
    
    file_path = os.path.join(directory, filename)
    if not os.path.exists(file_path):
        abort(404)
    
    return send_from_directory(directory, filename, as_attachment=True)

def get_local_ip():
    """Get the actual local IP address by attempting to connect to an external server."""
    try:
        # Create a socket and attempt connection to get local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            # Connect to Google's DNS (doesn't actually send data)
            s.connect(('8.8.8.8', 80))
            return s.getsockname()[0]
    except Exception:
        # Fallback to hostname resolution
        return socket.gethostbyname(socket.gethostname())

def generate_qr_code(url):
    """Generate and print ASCII QR code for the given URL."""
    try:
        qr = qrcode.QRCode(
            version=3,
            box_size=1,
            border=1
        )
        qr.add_data(url)
        qr.make()
        qr.print_ascii()
    except Exception as e:
        print(f"Could not generate QR code: {e}")

def valid_directory(path):
    abs_path = os.path.abspath(path)

    if not os.path.exists(abs_path):
        raise argparse.ArgumentTypeError(f"Directory '{path}' does not exist.")
    if not os.path.isdir(abs_path):
        raise argparse.ArgumentTypeError(f"Directory '{path}' is not a directory.")
    if not os.access(abs_path, os.R_OK):
        raise argparse.ArgumentTypeError(f"Directory '{path}' is not readable (permission denied).")

    return abs_path

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="SendMe - Share files over HTTP using your browser",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        'directory',
        type=valid_directory,
        nargs="?",
        default=".",
        help="Directory to share (default: current directory)"
    )
    
    parser.add_argument(
        '-p', '--port',
        type=int,
        default=8080,
        help='Port untuk server (default: 8080)'
    )
    
    parser.add_argument(
        '--host',
        type=str,
        default='0.0.0.0',
        help='Host interface (default: 0.0.0.0)'
    )
    
    parser.add_argument(
        '-q','--qr',
        action='store_true',
        help='Jangan tampilkan QR code'
    )
    
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug mode'
    )
    
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_arguments()
    
    # Set global ROOT_DIR from arguments
    ROOT_DIR = os.path.abspath(args.directory)
    
    # Get server info
    local_ip = get_local_ip()
    url = f"http://{local_ip}:{args.port}"
    
    print("=" * 50)
    print("SendMe")
    print("=" * 50)
    print(f"Root Directory: {ROOT_DIR}")    
    # Generate QR code if enable
    if args.qr:
        print("QR Code:")
        generate_qr_code(url)
        print("=" * 50)
    
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(
            host=args.host,
            port=args.port,
            debug=args.debug
        )
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped")
    except Exception as e:
        print(f"\n✗ Server error: {e}")
