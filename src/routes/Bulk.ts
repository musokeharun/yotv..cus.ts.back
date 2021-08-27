import {Request, Response} from "express";
import {Bulk, Contact} from "@entities/Models";
import ParseServer from "src/sources/ParseServer";
import {
    DEFAULT_MSISDN, nothingDone, resourceCreated,
    resourceFound, resourceNotFound,
    TAKE_NUMBER,
    UNTAGGED
} from "@shared/constants";
import {StatusCodes} from "http-status-codes";
import excelToJson from "convert-excel-to-json";
import {formatNumberTo256} from "@shared/functions";
import logger from "@shared/Logger";
import Parse from "parse/node";

const {OK, NOT_FOUND} = StatusCodes;

enum STATUS {
    PENDING,
    ACTIVE,
    COMPLETED,
    DISABLED
}

const bulkDao: Parse.Object = new Bulk();
const bulkQuery: Parse.Query = new ParseServer.Query(Bulk);
const contactDao: Parse.Object = new Contact();
const contactQuery: Parse.Query = new ParseServer.Query(Contact);

const addBulk = async (user: string, tag: string, status = STATUS.PENDING, total: number) => {
    return bulkDao.save({
        tag,
        status,
        total,
        used: 0,
        isActive: true
    });
}

const addContacts = async (contacts: string[], bulk: string) => {

    // FIXME TODO NOT WORKING
    let bulkFound: Parse.Object = await bulkQuery.get(bulk);
    let alreadyIn = 0;
    let tobeSaved = [];
    if (contacts.length) {
        for (const value of contacts) {
            const index = contacts.indexOf(value);
            // exists
            contactQuery.equalTo(DEFAULT_MSISDN, value.toString());
            let contactFound = await contactQuery.first();
            if (contactFound) {
                ++alreadyIn;
            } else {
                await contactDao.save({
                    [DEFAULT_MSISDN]: value,
                    isCalled: false,
                    isActive: true,
                    bulkId: bulk
                });
            }
            console.log(value);
        }
        await bulkFound.save({
            status: STATUS.ACTIVE,
            replica: alreadyIn
        });
        return;
    } else
        await bulkFound.save({
            status: STATUS.DISABLED,
            replica: 0
        });
    //FIXME TODO COMMUNICATE ABOUT IT WITH BULK DATA
}

export const uploadText = async (req: Request, res: Response) => {

    let {tag, contacts} = req.body;
    tag = tag ? tag : UNTAGGED;

    const {user} = res.locals;

    if (!contacts) {
        res.status(NOT_FOUND).json({
            err: resourceNotFound
        }).end();
        return;
    }

    // text to array
    const contactArray = contacts.trim().split(",");
    if (!contactArray.length) {
        logger.info("No contacts");
        res.status(OK).json({
            err: resourceNotFound
        }).end();
        return;
    }

    let createdBulk = await addBulk(user.id, tag, STATUS.PENDING, contactArray.length);

    res.status(OK).json({
        msg: resourceCreated,
        bulk: createdBulk
    }).end();

    // ADD TO CONTACTS
    addContacts(contacts, createdBulk.id).then(value => {
        logger.info("Completed");
    })
}

export const uploadExcel = async (req: Request, res: Response) => {

    let {tag, column} = req.body;
    const {user} = res.locals;

    tag = tag ? tag : UNTAGGED;

    if (!req.file || !column) {
        res.status(NOT_FOUND).json({
            err: resourceNotFound
        }).end();
        return;
    }

    const {buffer, filename, mimetype} = req.file;
    let result = excelToJson({
        source: buffer,
        columnToKey: {
            [column]: DEFAULT_MSISDN
        },
        header: {
            rows: 1
        }
    });

    const contacts: string[] = [];
    const sheets = Object.getOwnPropertyNames(result);
    if (!sheets.length) {
        res.status(OK).json({
            err: resourceNotFound
        }).end();
        return;
    }
    sheets.forEach((sheet) => {
        const sheetData = result[sheet];
        sheetData.forEach(value => {
            let msisdn = value[DEFAULT_MSISDN].toString();
            let formatted = formatNumberTo256(msisdn);
            !contacts.includes(formatted) ? contacts.push(formatted) : null;
        })
    })

    let createdBulk = await addBulk(
        user.id,
        tag,
        STATUS.PENDING,
        contacts.length
    );

    res.json({
        msg: resourceFound,
        bulk: createdBulk
    }).end();

    // ADD CONTACTS
    addContacts(contacts, createdBulk.id).then(value => {
        logger.info("Completed");
    })
}

export const getAllBulks = async (req: Request, res: Response) => {
    //TODO SELECT USING SQL
    let page: number = (req.query.page) ? parseInt(<string>req.query.page) : 1;
    if (isNaN(page)) page = 1;

    bulkQuery.select([""]);
    bulkQuery.skip((page - 1) * 100);
    bulkQuery.limit(TAKE_NUMBER);
    let bulks = await bulkQuery.find();
    res.status(OK).json({
        msg: resourceFound,
        bulks: [...bulks]
    }).end();
}