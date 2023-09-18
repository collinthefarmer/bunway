export type ConwayGridState = Uint8Array;
export type ConwayGridDelta = number[];
export type ConwayGridHistory = ConwayGridDelta[];

export class ConwayGrid {
    static tick(
        state: ConwayGridState,
        w: number,
        h: number
    ): [ConwayGridState, ConwayGridDelta] {
        const changes: ConwayGridDelta = [];
        const next: ConwayGridState = new Uint8Array(w * h).fill(0);

        const l = w * h;
        for (let i = 0; i < l; i++) {
            const c = state[i];
            const n = ConwayGrid.neighborSum(i, state, w, h);
            const v = ConwayGrid.cellState(c, n);

            next[i] = v;
            if (c !== v) changes.push(i);
        }

        return [next, changes];
    }

    private static neighborSum(
        i: number,
        state: ConwayGridState,
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
        history: ConwayGridHistory
    ): ConwayGridDelta {
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
        state: ConwayGridState,
        delta: ConwayGridDelta
    ): ConwayGridState {
        const next = new Uint8Array(state.length);
        for (const ci of delta) {
            next[ci] = +!state[ci];
        }
        return next;
    }


    public initial: ConwayGridState;

    public w: number;
    public h: number;

    constructor(
        w: number,
        h: number,
        initial?: ConwayGridState
    ) {
        this.w = w;
        this.h = h;

        this.initial = initial ?? new Uint8Array(w * h).fill(0);
    }
}