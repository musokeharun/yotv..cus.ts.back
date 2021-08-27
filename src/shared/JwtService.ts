import jsonwebtoken, {VerifyErrors} from 'jsonwebtoken';
import config from "config";

const {secret} = config.get("Auth")

export class JwtService {

    private readonly secret: string;
    private readonly options: any;
    private readonly VALIDATION_ERROR = 'Token validation failed.';


    constructor() {
        this.secret = secret;
        this.options = {expiresIn: "1day"};
    }

    /**
     * Encrypt data and return jwt.
     *
     * @param data
     */
    public getJwt(data: any): Promise<string> {
        return new Promise((resolve, reject) => {
            jsonwebtoken.sign(data, this.secret, this.options, (err, token) => {
                err ? reject(err) : resolve(token || '');
            });
        });
    }

    /**
     * Decrypt JWT and extract client data.
     *
     * @param jwt
     */
    public decodeJwt(jwt: string): Promise<any> {
        return new Promise((res, rej) => {
            jsonwebtoken.verify(jwt, this.secret, (err: VerifyErrors | null, decoded?: object) => {
                return err ? rej(this.VALIDATION_ERROR) : res(decoded);
            });
        });
    }
}
