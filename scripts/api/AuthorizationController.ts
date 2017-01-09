import * as express from 'express';
import {injectable} from 'inversify';
import {interfaces,Controller, Post} from 'inversify-express-utils';

@Controller('/api/authorization')
@injectable()
class AuthorizationController implements interfaces.Controller {

    @Post('/check')
    check(request: express.Request, response: express.Response): void {
        response.json({authorization: "success"});
    }

}

export default AuthorizationController;