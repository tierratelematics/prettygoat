import {IMiddleware, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";

export default class MockMiddleware implements IMiddleware {
    transform(request: IRequest, response: IResponse, next: Function) {
    }

}