import {ISubject} from "rx";

class MockSubject implements ISubject<any>{

    hasObservers(): boolean {
        return null;
    }

    subscribe(observer: Rx.IObserver<any>):Rx.IDisposable;
    subscribe(onNext?: (value: any)=>void, onError?: (exception: any)=>void, onCompleted?: ()=>void):Rx.IDisposable;
    subscribe(...arg: any[]){
        return null;
    }

    onNext(value: any): void {
    }

    onError(exception: any): void {
    }

    onCompleted(): void {

    }

    dispose(): void {

    }

}

export default MockSubject;