import * as express from 'express';
import {injectable, inject, optional} from 'inversify';
import {interfaces, Controller, Post} from 'inversify-express-utils';
import IEngineData from "../configs/IEngineData";

@Controller('/api/authorization')
@injectable()
class AuthorizationController implements interfaces.Controller {

    constructor(@inject("IEngineData") @optional() private engineData: IEngineData) {
    }

    @Post('/check')
    check(request: express.Request, response: express.Response): void {
        response.json({authorization: "success", engineData: this.engineData});
    }

}

export default AuthorizationController;