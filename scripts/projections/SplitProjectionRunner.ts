import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import * as Rx from "rx";
import IProjectionRunner from "./IProjectionRunner";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import * as _ from "lodash";
import {SpecialNames} from "../matcher/SpecialNames";
import Dictionary from "../Dictionary";
import {Snapshot} from "../snapshots/ISnapshotRepository";

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

    run(snapshot?:Snapshot<T|Dictionary<T>>):void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.state = snapshot ? <Dictionary<T>>snapshot.memento : {};

        let eventsStream = this.stream
            .from(snapshot ? snapshot.lastEvent : null)
            .merge(this.readModelFactory.from(null))
            .filter(event => event.type !== this.streamId && !_.startsWith(event.type, "__diagnostic"));

        this.subscription = eventsStream.subscribe(event => {
            try {
                let splitFn = this.splitMatcher.match(event.type),
                    splitKey = splitFn(event.payload),
                    matchFn = this.matcher.match(event.type);
                if (matchFn !== Rx.helpers.identity) {
                    if (splitFn !== Rx.helpers.identity) {
                        let childState = this.state[splitKey];
                        if (_.isUndefined(childState))
                            this.state[splitKey] = this.getInitialState(matchFn, event, splitKey);
                        else
                            this.state[splitKey] = matchFn(childState, event.payload, event);
                        this.notifyStateChange(splitKey, event.timestamp);
                    } else {
                        this.dispatchEventToAll(matchFn, event);
                    }
                }
            } catch (error) {
                this.isFailed = true;
                this.subject.onError(error);
                this.stop();
            }
        });
    }

    private getInitialState(matchFn:Function, event, splitKey:string):T {
        let state:T = matchFn(this.matcher.match(SpecialNames.Init)(), event.payload, event);
        this.readModelFactory.from(null).subscribe(readModel => {
            let matchFn = this.matcher.match(readModel.type);
            if (matchFn !== Rx.helpers.identity) {
                this.state[splitKey] = matchFn(this.state[splitKey], readModel.payload, readModel);
                this.notifyStateChange(splitKey, event.timestamp);
            }
        });
        return state;
    }

    private dispatchEventToAll(matchFn:Function, event) {
        _.mapValues(this.state, (state, key) => {
            this.state[key] = matchFn(state, event.payload, event);
            this.notifyStateChange(key, event.timestamp);
        });
    }

    private notifyStateChange(splitKey:string, timestamp:string) {
        this.subject.onNext({
            type: this.streamId,
            payload: this.state[splitKey],
            timestamp: timestamp,
            splitKey: splitKey
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
