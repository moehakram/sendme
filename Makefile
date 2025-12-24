.PHONY: dev dev-backend dev-frontend build setup install uninstall

setup:
	uv sync
	cd frontend && npm install

dev:
	@npx concurrently \
	-n 'WEB,API' \
	-c 'green,blue' \
	"$(MAKE) dev-backend" \
	"$(MAKE) dev-frontend" \
	--kill-others

dev-backend:
	uv run sendme --port 8080 .

dev-frontend:
	cd frontend && npm run dev

build:
	@cd frontend && npm run build
	@find src/sendme/dist -mindepth 1 -not -name '.gitignore' -delete
	@cp -r frontend/dist/* src/sendme/dist/

install: build
	uv tool install .

uninstall:
	uv tool uninstall sendme
