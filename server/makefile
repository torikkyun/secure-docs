db-dev:
	docker compose \
		-f compose.db.yml \
		--env-file .env.development.local \
		up -d --build

db-prod:
	docker compose \
		-f compose.yml \
		--env-file .env.production.local \
		up -d --build
