import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import * as Rx from "rx";
import IProjectionRunner from "./IProjectionRunner";
import IReadModelFactory from "../streams/IReadModelFactory";
import Event from "../streams/Event";
import * as _ from "lodash";
import {SpecialNames} from "../matcher/SpecialNames";
import Dictionary from "../Dictionary";

class SplitProjectionRunner<T> implements IProjectionRunner<T> {
    public state:Dictionary<T> = {};
    private subscription:Rx.IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private subject:Rx.Subject<Event>;

    constructor(private streamId:string, private stream:IStreamFactory, private matcher:IMatcher,
                private splitMatcher:IMatcher, private readModelFactory:IReadModelFactory) {
        this.subject = new Rx.Subject<Event>();
    }

    run():void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.subscription = this.stream.from(null).merge(this.readModelFactory.from(null)).subscribe(event => {
            try {
                let splitFn = this.splitMatcher.match(event.type),
                    splitKey = splitFn(event.payload),
                    matchFn = this.matcher.match(event.type);
                if (matchFn === Rx.helpers.identity) return;
                if (splitFn !== Rx.helpers.identity) {
                    let childState = this.state[splitKey];
                    if (_.isUndefined(childState)) {
                        childState = matchFn(this.matcher.match(SpecialNames.Init)(), event.payload);
                        this.state[splitKey] = childState;
                        this.subject.onNext({
                            type: this.streamId,
                            payload: childState,
                            timestamp: event.timestamp,
                            splitKey: splitKey
                        });
                        this.readModelFactory.from(null).subscribe(readModel => {
                            let matchFn = this.matcher.match(readModel.type);
                            if (matchFn !== Rx.helpers.identity) {
                                this.state[splitKey] = matchFn(this.state[splitKey], readModel.payload);
                                this.subject.onNext({
                                    type: this.streamId,
                                    payload: this.state[splitKey],
                                    timestamp: event.timestamp,
                                    splitKey: splitKey
                                });
                            }
                        });
                    } else {
                        childState = matchFn(childState, event.payload);
                        this.state[splitKey] = childState;
                        this.subject.onNext({
                            type: this.streamId,
                            payload: childState,
                            timestamp: event.timestamp,
                            splitKey: splitKey
                        });
                    }
                } else {
                    _.mapValues(this.state, (state, key) => {
                        this.state[key] = matchFn(state, event.payload);
                    });
                }
            } catch (error) {
                this.isFailed = true;
                this.subject.onError(error);
                this.stop();
            }
        });
    }

    stop():void {
        this.isDisposed = true;

        if (this.subscription)
            this.subscription.dispose();
        if (!this.isFailed)
            this.subject.onCompleted();
    }

    dispose():void {
        this.stop();
        if (!this.subject.isDisposed)
            this.subject.dispose();
    }

    subscribe(observer:Rx.IObserver<Event>):Rx.IDisposable
    subscribe(onNext?:(value:Event) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<Event>) | ((value:Event) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<Event>) | ((value:Event) => void)):observerOrOnNext is Rx.IObserver<Event> {
    return (<Rx.IObserver<Event>>observerOrOnNext).onNext !== undefined;
}

export default SplitProjectionRunner
