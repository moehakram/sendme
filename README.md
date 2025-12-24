Simple file server + web file explorer to quickly share & manage files/folders on your local network.

## Features

- Browse folders with breadcrumb
- Multi-file upload (auto-rename on duplicates)
- Download, delete, and rename files/folders
- QR code for easy mobile access

## Quick Start

```bash
# Install via uv
uv tool install git+https://github.com/moehakram/sendme.git

# Install via pip (user install)
pip install --user git+https://github.com/moehakram/sendme.git


# Uninstall
uv tool uninstall sendme

pip uninstall sendme
```

### Examples

```bash
# Help
sendme -h

# Serve current directory on default port (8000)
sendme .

# Serve a specific directory on port 8080
sendme /path/to/dir -p 8080

# Show QR, verbose logs
sendme .  --qr --debug
```

## For development

```bash
# Install
git clone https://github.com/moehakram/sendme.git
cd sendme
make setup    # uv sync + install frontend deps

# run
make dev     # open http://localhost:5173/

# or run via command sendme
make install
sendme .    # open http://localhost:8000
```

## License

Open source. Use and modify freely.
