import StatusCodes from 'http-status-codes';
import {Request, Response, NextFunction} from 'express';
import multer from "multer";

import {cookieProps, couldnTAuthenticateRequest, paramMissingError} from '@shared/constants';
import {JwtService} from '@shared/JwtService';
import Joi from "joi";
import {validate} from "@shared/functions";
import logger from "@shared/Logger";

const jwtService = new JwtService();
const {UNAUTHORIZED, BAD_REQUEST} = StatusCodes;

// Middleware to verify if user is logged in
export const authMw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get json-web-token
        const jwt = req.header(cookieProps.key);
        if (!jwt) {
            throw Error(couldnTAuthenticateRequest);
        }
        // Make sure user is logged in
        const clientData = await jwtService.decodeJwt(jwt);
        if (!!clientData) {
            res.locals.user = clientData;
            next();
        } else {
            logger.info("Jwt Failed")
            throw Error(couldnTAuthenticateRequest);
        }
    } catch (err) {
        return res.status(UNAUTHORIZED).json({
            err: err.message || couldnTAuthenticateRequest,
        });
    }
};

//register--login--save
export const authFormMw = async (req: Request, res: Response, next: NextFunction) => {

    const {email, password, isActive, isAdmin} = req.body;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6),
        isActive: Joi.number(),
        isAdmin: Joi.number()
    });

    if (validate(schema, {email, password, isAdmin, isActive})) {
        res.status(BAD_REQUEST).json({
            err: paramMissingError
        }).end();
        return;
    }

    next();
}

const memoryStorage = multer.memoryStorage()
export const multerMemory = multer({storage: memoryStorage})