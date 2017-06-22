class Tick {
    state: string;
    clock: Date | number;

    constructor(clock: Date, state?: string) {
        this.clock = clock;
        this.state = state;
    }
}

export default Tick
