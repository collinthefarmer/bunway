export type ConwayGameState = Uint8Array;
export type ConwayGameDelta = number[];
export type ConwayGameHistory = ConwayGameDelta[];

export class ConwayGame {
    private static stateTick(
        state: ConwayGameState,
        w: number,
        h: number
    ): [ConwayGameState, ConwayGameDelta] {
        const changes: ConwayGameDelta = [];
        const next: ConwayGameState = new Uint8Array(w * h).fill(0);

        const l = w * h;
        for (let i = 0; i < l; i++) {
            const c = state[i];
            const n = ConwayGame.neighborSum(i, state, w, h);
            const v = ConwayGame.cellState(c, n);

            next[i] = v;
            if (c !== v) changes.push(i);
        }

        return [next, changes];
    }

    private static neighborSum(
        i: number,
        state: ConwayGameState,
        w: number,
        h: number
    ): number {
        const canN = i - w > 0;
        const canW = i % w > 0;
        const canS = i + w < w * h;
        const canE = i % w < w - 1;

        return (
            +canN * +canW * state[i - w - 1] + // north-west
            +canN * state[i - w] + // north
            +canN * +canE * state[i - w + 1] + // north-east
            +canE * state[i + 1] + // east
            +canS * +canE * state[i + w + 1] + // south-east
            +canS * state[i + w] + // south
            +canS * +canW * state[i + w - 1] + // south-west
            +canW * state[i - 1] // west
        );
    }

    private static cellState(alive: number, nct: number): number {
        return +((alive && (nct === 2 || nct === 3)) || (!alive && nct === 3));
    }

    static collapseHistory(
        history: ConwayGameHistory
    ): ConwayGameDelta {
        const changes = history.flat();

        const changed: number[] = [];
        for (const c of changes) {
            if (c in changed) {
                delete changed[c];
                continue;
            }

            changed[c] = c;
        }

        return changed;
    }

    static applyDelta(
        state: ConwayGameState,
        delta: ConwayGameDelta
    ): ConwayGameState {
        const next = new Uint8Array(state.length);
        for (const ci of delta) {
            next[ci] = +!state[ci];
        }
        return next;
    }

    public state: ConwayGameState;
    public delta: ConwayGameDelta = [];
    public history: ConwayGameHistory = [];
    public initial: ConwayGameState;

    public w: number;
    public h: number;

    constructor(
        w: number,
        h: number,
        initial?: ConwayGameState
    ) {
        this.w = w;
        this.h = h;

        this.initial = initial ?? new Uint8Array(w * h).fill(0);
        this.state = this.initial;
    }

    tick(): void {
        const [next, change] = ConwayGame.stateTick(this.state, this.w, this.h);

        this.state = next;
        this.delta = change;
        this.history.push(change);
    }
}
