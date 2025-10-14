import ViewController from '@/controllers/view.controller';
import { Pages } from '@/enums/pages.enum';
import catchError from '@/middlewares/catchError.middleware';
import { Router } from 'express';

const viewRoute = Router();

/* ------------------------ Home page ----------------------- */
const homePageController = catchError(ViewController.pageMapper[Pages.HOME]);
viewRoute.get('/', homePageController);

/* ------------------------ More page ----------------------- */

export default viewRoute;
