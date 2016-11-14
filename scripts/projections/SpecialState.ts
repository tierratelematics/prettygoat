export interface ISpecialState<T> {
    state:T;
}

export class SpecialStates {

    static stopSignalling<T>(state:T):ISpecialState<T> {
        return new StopSignallingState(state);
    }
}

export class StopSignallingState<T> implements ISpecialState<T> {
    state:T;

    constructor(state:T) {
        this.state = state;
    }
}