import { Pages } from '@/enums/pages.enum';
import ViewService from '@/services/view.service';
import { NextFunction, Request, Response } from 'express';

export default class ViewController {
    public static pageMapper = {
        [Pages.HOME]: this.homePageController
        // Add more page here
    };

    private static async homePageController(req: Request, res: Response, next: NextFunction) {
        const data = await ViewService.getHomePageData();

        // Render view
        res.render(Pages.HOME, data);
    }
}
