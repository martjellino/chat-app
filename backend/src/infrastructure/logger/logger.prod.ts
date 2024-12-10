import { winstonLogger } from "../utils/winston"
import { injectable } from "inversify";
import "reflect-metadata"

@injectable()
export class LoggerProd {
    info(message: string) {
        winstonLogger.info(`Logger Prod: ${message}`)
    }
}