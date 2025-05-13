.PHONY: run

NODE=node
NODE_TS=$(NODE) --experimental-transform-types

run: TYPE=websocket
run:
	$(NODE_TS) src/index.ts $(TYPE)
