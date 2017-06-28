import {interfaces} from "inversify";
import IServiceLocator from "./IServiceLocator";

interface IObjectContainer extends IServiceLocator {
    set<T>(key: string, object: interfaces.Newable<T> | T, parent?: string);
    resolve<T>(constructor: interfaces.Newable<T>);
    contains(key: string): boolean;
    remove(key: string): void;
}

export default IObjectContainer;
