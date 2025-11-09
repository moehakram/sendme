.PHONY: dev dev-backend dev-frontend build setup

setup:
	cd frontend && npm install


dev:
	@trap 'kill $$(jobs -p)' EXIT;\
	make dev-backend & \
	make dev-frontend & \
	wait

dev-backend:
	uv run sendme --port 8080 .

dev-frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build
	find src/sendme/dist -mindepth 1 -not -name '.gitignore' -delete
	cp -r frontend/dist/* src/sendme/dist/

install: build
	uv tool install .
