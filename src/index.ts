import { join } from "path/posix";

import { staticPlugin } from "@elysiajs/static";
import { Elysia, ws } from "elysia";

import { Eta } from "eta";

import { ConwayGameManager } from "./game";
import { ConwayGridDelta } from "./conway";

const location = "localhost:3000";

const eta = new Eta({ views: "templates", cache: true, cacheFilepaths: true });

const app = new Elysia()
    .use(staticPlugin())
    .use(ws())
    .state("gm", new ConwayGameManager())
    .get("/games", async () => Bun.file("./templates/games.html"))
    .post("/games", async ({ store }) => {
        const game = store.gm.createGame();
        const gameLoc = join(location, "games", game.id);
        return eta.render("gameGrid", { game, location: gameLoc });
    })
    .ws("/games/:id", {
        open(ws) {
            const { gm } = ws.data.store as { gm: ConwayGameManager };

            const gameId = ws.data.params.id;
            const game = gm.getGame(gameId);

            if (!game) {
                ws.close();
                return;
            }

            game.changes$.subscribe((changes: ConwayGridDelta) => {
                ws.send(eta.render("gameData", { game, changes }));
            });
        },
        message(ws, message) {
            const { gm } = ws.data.store as { gm: ConwayGameManager };

            const gameId = ws.data.params.id;
            const game = gm.getGame(gameId);

            if (!game) {
                ws.close();
                return;
            }

            const target = (message as any).HEADERS["HX-Target"] as string;
            const coords = target.match(/x(\d+)y(\d+)/);
            if (!coords || coords.length !== 3) throw new Error();

            const targetIndex = parseInt(coords[1]) + parseInt(coords[2]) * game.grid.w;

            // this should push manipulations to subject which pauses ticking for some amount of time,
            // additionally, should ensure manipulations appear in the changes feed
            game.state.set([1], targetIndex);
        }
    })
    .listen(3000);