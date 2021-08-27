import StatusCodes from 'http-status-codes';
import {Request, Response} from 'express';
import {
    nothingDone,
    paramMissingError,
    resourceCreated,
    resourceNotFound,
    resourceUpdated
} from '@shared/constants';
import {Users} from "@entities/Models";
import ParseServer from "../sources/ParseServer";
import Parse from "parse/node";
import config from "config";
import bcrypt from "bcrypt";

const userDao: Parse.Object = new Users();
const userQuery: Parse.Query = new ParseServer.Query(Users);
const {BAD_REQUEST, CREATED, OK, NOT_FOUND} = StatusCodes;
const {salt} = config.get("Auth");
const _salt = bcrypt.genSaltSync(salt);


/**
 * Get all users.
 *
 * @param req
 * @param res
 * @returns
 */
export async function getAllUsers(req: Request, res: Response) {
    userQuery.select(["email", "isActive", "isAdmin"]);
    const users = await userQuery.findAll();
    return res.status(OK).json({users});
}


/**
 * Add one user.
 *
 * @param req
 * @param res
 * @returns
 */
export async function addOneUser(req: Request, res: Response) {
    const {email, password, isAdmin, isActive} = req.body;
    if (!password) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }

    const hash = bcrypt.hashSync(password, _salt);

    let createdUser = await userDao.save({
        email,
        password: hash,
        isAdmin: !!isAdmin,
        isActive: !!isActive
    });
    return res.status(CREATED).json({
        msg: resourceCreated,
        user: createdUser
    }).end();
}


/**
 * Update one user.
 *
 * @param req
 * @param res
 * @returns
 */
export async function updateOneUser(req: Request, res: Response) {
    const {email, id, password, isAdmin, isActive} = req.body;
    if (!id) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }

    const updated: any = {};
    if (email) updated.email = email;
    if (isAdmin) updated.isAdmin = !!isAdmin;
    if (isActive) updated.isActive = !!isActive;
    if (password) updated.password = bcrypt.hashSync(password, salt);

    let userFound: Parse.Object = await userQuery.get(id);
    if (!userFound) {
        res.status(NOT_FOUND).json({err: resourceNotFound}).end();
        return;
    }

    let userUpdated = await userFound.save(updated);
    return res.status(OK).json({
        msg: resourceUpdated,
        user: userUpdated
    }).end();
}


/**
 * Delete one user.
 *
 * @param req
 * @param res
 * @returns
 */
export async function deleteOneUser(req: Request, res: Response) {
    // const {id} = req.params;
    // await userDao.delete(Number(id));
    return res.status(OK).json({
        msg: nothingDone
    }).end();
}
