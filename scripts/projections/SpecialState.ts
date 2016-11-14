export abstract class SpecialState<T> {
    state:T;
}

export class SpecialStates {

    static stopSignalling<T>(state:T):SpecialState<T> {
        return new StopSignallingState(state);
    }

    static deleteSplit():SpecialState<void> {
        return new DeleteSplitState();
    }
}

export class StopSignallingState<T> extends SpecialState<T> {
    state:T;

    constructor(state:T) {
        super();
        this.state = state;
    }
}

export class DeleteSplitState extends SpecialState<void> {
    state:void;

    constructor() {
        super();
        this.state = undefined;
    }
}