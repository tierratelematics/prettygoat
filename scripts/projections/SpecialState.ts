export abstract class SpecialState<T> {
    state:T;
}

export class SpecialStates {

    static stopSignalling<T>(state:T):SpecialState<T> {
        return new StopSignallingState(state);
    }
}

export class StopSignallingState<T> extends SpecialState<T> {
    state:T;

    constructor(state:T) {
        super();
        this.state = state;
    }
}