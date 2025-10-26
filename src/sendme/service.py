from flask import current_app, url_for, abort
import os
import argparse
import socket
import qrcode

def format_size(size_bytes):
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
            version=1,
            box_size=1,
            border=1
        )
        qr.add_data(url)
        qr.make()
        qr.print_ascii(invert=True)
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
    parser = argparse.ArgumentParser(description='sendme - Simple File Server')
    parser.add_argument('directory', nargs='?',type=valid_directory, default='.', help='Directory to serve (default: current directory)')
    parser.add_argument('-p', '--port', type=int, default=8000, help='Port to run the server on (default: 8000)')
    parser.add_argument('-H', '--host', default='0.0.0.0', help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    parser.add_argument('--qr', action='store_true', help='Generate QR code for easy mobile access')
    return parser.parse_args()

def print_server_info(root_dir: str, port: str, show_qr: bool) -> None:
    """Print server information and QR code if enabled"""
    print("=" * 50)
    print("SendMe - File Server")
    print("=" * 50)
    print(f"Root Directory: {root_dir}")
    
    if show_qr:
        local_ip = get_local_ip()
        url = f"http://{local_ip}:{port}"
        print(f"\nQR Code for: {url}")
        generate_qr_code(url)
    
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print()

def get_root_dir() -> str:
    """Get the configured root directory"""
    return current_app.config.get('ROOT_DIR', '.')
