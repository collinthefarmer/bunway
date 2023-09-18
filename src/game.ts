import { interval, map, Observable, tap } from "rxjs";
import { randomUUID } from "crypto";

import { ConwayGrid, ConwayGridDelta, ConwayGridHistory, ConwayGridState } from "./conway";


export class ConwayGame {
    public static TICK_INTERVAL = 1000;

    public static defaultGridGame() {
        const grid = new ConwayGrid(
            32, 32
        );

        grid.initial.set([1, 1, 1], 80);

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
                    return changes;
                }),
                tap((changes) => this.history.push(changes))
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