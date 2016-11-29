export abstract class SpecialState<T> {
    state:T;
}

export class SpecialStates {

    static stopSignalling<T>(state:T):SpecialState<T> {
        return new StopSignallingState(state);
    }

    static deleteSplit():SpecialState<any> {
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

export class DeleteSplitState extends SpecialState<any> {
    state:any;

    constructor() {
        super();
        this.state = undefined;
    }
}