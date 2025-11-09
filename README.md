
Simple file server + web file explorer to quickly share & manage files/folders on your local network.

## Features
- Browse folders with breadcrumb
- Multi-file upload (auto-rename on duplicates)
- Download, delete, and rename files/folders
- QR code for easy mobile access

## Quick Start
```bash
git clone https://github.com/moehakram/sendme.git
cd sendme
make setup        # uv sync + install frontend deps
make dev          # run backend (8080) + frontend (Vite) in parallel
```

Backend only:
```bash
uv sync
sendme            # default port 8000
sendme -p 8080    # match the frontend proxy when developing
```

Custom example:
```bash
sendme /path/to/dir -p 9000 --qr --debug
```

Open: http://localhost:8000 (default) or http://localhost:8080 when using the combined dev mode.

## Frontend Dev
```bash
cd frontend
npm install
npm run dev      # proxies /api/ -> http://localhost:8080
```
Production build:
```bash
make build       # builds and copies to src/sendme/dist
```

## CLI install (global via uv tool)
```bash
make install
sendme --help
make uninstall
```

## License
Open source. Use and modify freely.