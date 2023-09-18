import { interval, map, Observable, tap } from "rxjs";
import { randomUUID } from "crypto";

import { ConwayGrid, ConwayGridDelta, ConwayGridHistory, ConwayGridState } from "./conway";


export class ConwayGame {
    public static TICK_INTERVAL = 1000;

    public static defaultGridGame() {
        const grid = new ConwayGrid(
            16, 16
        );

        const l = grid.w * grid.h;

        // randomize initial grid state for funsies
        for (let i = 0; i < l; i++) {
            grid.initial.set([+(Math.random() > .5)], i);
        }

        return new ConwayGame(grid);
    }

    public id: string;

    public state: ConwayGridState;
    public history: ConwayGridHistory = [];

    private _changes?: Observable<ConwayGridDelta>;

    get changes$() {
        if (!this._changes) {
            this._changes = interval(ConwayGame.TICK_INTERVAL).pipe(
                map(_ => {
                    const [state, changes] = ConwayGrid.tick(this.state, this.grid.w, this.grid.h);
                    this.state = state;
                    this.history.push(changes);

                    return changes;
                })
            );
        }

        return this._changes;
    }

    constructor(public grid: ConwayGrid) {
        this.id = randomUUID();
        this.state = this.grid.initial;
    }
}


export class ConwayGameManager {
    private games: Map<string, ConwayGame>;

    constructor() {
        this.games = new Map<string, ConwayGame>();
    }

    createGame(): ConwayGame {
        const game = ConwayGame.defaultGridGame();
        this.games.set(game.id, game);

        return game;
    }

    getGame(id: string): ConwayGame | null {
        const game = this.games.get(id);
        return game ?? null;
    }
}