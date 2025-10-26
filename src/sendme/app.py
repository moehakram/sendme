import sys
from flask import Flask, abort, send_from_directory, jsonify, request
# from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import shutil
from sendme.service import format_size, get_root_dir, parse_arguments, print_server_info
# Get the directory where this module is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'dist')

# Create Flask app
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')

# CORS(app)

@app.route('/api/files')
def api_list_files():
    """API endpoint to list files and directories"""
    try:
        path = request.args.get('path', '')
        root_dir = get_root_dir()
        
        # Security: prevent directory traversal
        full_path = os.path.abspath(os.path.join(root_dir, path.lstrip('/')))
        if not full_path.startswith(root_dir):
            return jsonify({'error': 'Access denied'}), 403
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'Path not found'}), 404
        
        items = []
        for item in sorted(os.listdir(full_path)):
            item_path = os.path.join(full_path, item)
            rel_path = os.path.relpath(item_path, root_dir)
            
            stat = os.stat(item_path)
            is_dir = os.path.isdir(item_path)
            
            items.append({
                'name': item,
                'path': rel_path,
                'is_directory': is_dir,
                'size': stat.st_size if not is_dir else 0,
                'size_formatted': format_size(stat.st_size) if not is_dir else '-',
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'modified_formatted': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Get breadcrumb path
        breadcrumbs = []
        current = path
        while current:
            parts = current.split('/')
            breadcrumbs.insert(0, {
                'name': parts[-1],
                'path': current
            })
            current = '/'.join(parts[:-1])
        
        return jsonify({
            'current_path': path,
            'items': items,
            'breadcrumbs': breadcrumbs,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download')
def api_download_file():
    """API endpoint to download a file"""
    try:
        path = request.args.get('path', '')
        root_dir = get_root_dir()
        
        # Security: prevent directory traversal
        full_path = os.path.abspath(os.path.join(root_dir, path.lstrip('/')))
        if not full_path.startswith(root_dir):
            return jsonify({'error': 'Access denied'}), 403
        
        if not os.path.exists(full_path) or os.path.isdir(full_path):
            return jsonify({'error': 'File not found'}), 404
        
        directory = os.path.dirname(full_path)
        filename = os.path.basename(full_path)
        
        return send_from_directory(directory, filename, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def api_upload_file():
    """API endpoint to upload files"""
    try:
        path = request.form.get('path', '')
        root_dir = get_root_dir()
        
        # Security: prevent directory traversal
        upload_dir = os.path.abspath(os.path.join(root_dir, path.lstrip('/')))
        if not upload_dir.startswith(root_dir):
            return jsonify({'error': 'Access denied'}), 403
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        
        # Check if file already exists
        if os.path.exists(file_path):
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(file_path):
                filename = f"{base}_{counter}{ext}"
                file_path = os.path.join(upload_dir, filename)
                counter += 1
        
        file.save(file_path)
        
        return jsonify({
            'message': f'File "{filename}" uploaded successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete', methods=['DELETE'])
def api_delete_file():
    """API endpoint to delete a file"""
    try:
        data = request.get_json()
        path = data.get('path', '')
        root_dir = get_root_dir()
        
        # Security: prevent directory traversal
        full_path = os.path.abspath(os.path.join(root_dir, path.lstrip('/')))
        if not full_path.startswith(root_dir):
            return jsonify({'error': 'Access denied'}), 403
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'File not found'}), 404
        
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)
        
        return jsonify({
            'message': 'Deleted successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    """Serve SPA index.html"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def catch_all(path):
    """Catch-all route for SPA routing"""
    if path.startswith('api/'):
        abort(404)
    
    # Check if file exists in static folder
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    # Otherwise serve index.html for client-side routing
    return send_from_directory(app.static_folder, 'index.html')


def main() -> int:
    """Entry point for the CLI"""
    try:
        args = parse_arguments()

        app.config['ROOT_DIR'] = args.directory
        # Start the server
        print_server_info(args.directory, args.port, args.qr)
        app.run(host=args.host, port=args.port, debug=args.debug)
        return 0
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped gracefully")
        return 0
    except OSError as e:
        print(f"\n✗ Server error: {e}")
        if "Address already in use" in str(e):
            print(f"Port {args.port} is already in use. Try a different port.")
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())