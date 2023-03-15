import { Request, Response } from 'express';

import { EsloModels } from '../../models';

export type EsloContext = {
    req: Request;
    res: Response;
    models: EsloModels;
};
