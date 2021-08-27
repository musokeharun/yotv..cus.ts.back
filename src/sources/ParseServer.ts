import Parse from "parse/node";

Parse.initialize("APP_ID", "JS_KEY", "APP_ID");
Parse.serverURL = process.env.SERVER_URL || "http://localhost:1337/parse";

//OBJECTS - TABLES
const Logger = Parse.Object.extend("Logger");

export enum LogType {
    ERROR,
    DEBUG,
    SUCCESS,
    INFO,
    WARNING,
    CRITICAL,
}

export enum LogAction {
    GET,
    INSERT,
    UPDATE,
    DELETE,
    DISABLE,
    ENABLE,
}

export const Log = async (
    type: LogType,
    action: LogAction,
    userId?: string,
    customerId?: string,
    params1?: any,
    params2?: any,
    params3?: any,
    params4?: any
) => {
    const log = new Logger();
    return log.save({
        type,
        action,
        userId,
        customerId,
        params1,
        params2,
        params3,
        params4,
    });
};

const ParseServer = Parse;
export default ParseServer;