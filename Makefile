install:
	cd app && npm i

dev:
	cd app && npm run dev

build:
	cd app && npm run build

preview:
	cd app && npm run preview

compose:
	cd app && docker-compose -f compose.yml up -d