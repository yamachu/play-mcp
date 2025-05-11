.PHONY: run run/server

NODE=node
NODE_TS=$(NODE) --experimental-transform-types

run:
	$(NODE_TS) --env-file=.env src/index.ts

run/server:
	$(NODE_TS) src/server.ts
