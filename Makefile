install:
	cd app && npm i

dev:
	cd app && npm run dev

build:
	cd app && npm run build

start:
	cd app && npm run start

preview:
	cd app && npm run preview

compose:
	cd app && docker-compose -f compose.yml up -d --build --force-recreate

logs:
	cd app && docker-compose -f compose.yml logs