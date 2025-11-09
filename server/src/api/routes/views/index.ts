import ViewController from '@/controllers/view.controller';
import { Pages } from '@/enums/pages.enum';
import catchError from '@/middlewares/catchError.middleware';
import { Router } from 'express';

import path from 'path/win32';

const viewRoute = Router();

/* ------------------------ Home page ----------------------- */
const homePageController = catchError(ViewController.pageMapper[Pages.HOME]);
viewRoute.get('/', homePageController);
viewRoute.get('/abc', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../../public/abc.html'));
})

/* ------------------------ More page ----------------------- */

export default viewRoute;
