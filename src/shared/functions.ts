import logger from './Logger';
import Joi from "joi";

// Print an error if the error message in truthy
export const pErr = (err: Error) => {
    if (err) {
        logger.err(err);
    }
};

// Get a random number between 1 and 1,000,000,000,000
export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

export const validate = (schema: Joi.Schema, body: any) => {
    const {value, error} = schema.validate(body);
    logger.info(error);
    return !!error;
}

export const formatNumberTo256 = (contact: string) => {
    if (contact.startsWith("256")) return contact;
    else if (contact.startsWith("0")) return "256" + contact.slice(1);
    return contact;
}

export const formatNumberTo07 = (contact: string) => {
    if (contact.startsWith("0")) return contact;
    else if (contact.startsWith("256")) return "0" + contact.slice(3);
    return contact;
}