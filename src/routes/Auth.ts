import bcrypt from 'bcrypt';
import {Request, Response, Router} from 'express';
import StatusCodes from 'http-status-codes';

import {JwtService} from '@shared/JwtService';
import {
    paramMissingError,
    loginFailedErr,
    cookieProps,
    loggedIn,
    nothingDone
} from '@shared/constants';
import Parse from "parse/node";
import {Users} from "@entities/Models";
import ParseServer from "../sources/ParseServer";
import logger from "@shared/Logger";

const userQuery: Parse.Query = new ParseServer.Query(Users);
const jwtService = new JwtService();
const {BAD_REQUEST, OK, UNAUTHORIZED} = StatusCodes;

/**
 * Login in a user.
 *
 * @param req
 * @param res
 * @returns
 */
export async function login(req: Request, res: Response) {

    // Check email and password present
    const {email, password} = req.body;
    if (!(email && password)) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }

    // Fetch user
    userQuery.equalTo("email", email);
    const user = await userQuery.first();
    if (!user || !user.get("isActive")) {
        logger.info(email + " not found | inactive.");
        return res.status(UNAUTHORIZED).json({
            error: loginFailedErr,
        });
    }

    // Check password
    const pwdPassed = await bcrypt.compare(password, user.get("password"));
    if (!pwdPassed) {
        logger.info("Password Incorrect");
        return res.status(UNAUTHORIZED).json({
            error: loginFailedErr,
        });
    }

    // Setup Admin Token
    const jwt = await jwtService.getJwt({
        id: user.id,
        email: user.get("email"),
        isAdmin: user.get("isAdmin"),
    });
    // Return
    return res.set("x-token", jwt).status(OK).json({
        msg: loggedIn,
        token: jwt
    }).end();
}

/**
 * Logout the user.
 *
 * @param req
 * @param res
 * @returns
 */
export async function logout(req: Request, res: Response) {
    return res.status(OK).json(nothingDone).end();
}
