import {ADMIN_API_TOKEN} from "../Enum/EnvironmentVariable";
import {IoSocketController} from "_Controller/IoSocketController";
import {stringify} from "circular-json";
import {HttpRequest, HttpResponse} from "uWebSockets.js";
import { parse } from 'query-string';
import {App} from "../Server/sifrr.server";
import {socketManager} from "../Services/SocketManager";
import { BaseController } from "./BaseController";

export class DebugController extends BaseController {
    constructor(private App : App) {
        super();
        this.getDump();
    }


    getDump(){
        this.App.options("/dump", (res: HttpResponse, req: HttpRequest) => {
            this.addCorsHeaders(res);
            res.end();
        });

        this.App.get("/dump", (res: HttpResponse, req: HttpRequest) => {
            const query = parse(req.getQuery());

            // if (query.token !== ADMIN_API_TOKEN) {
            //     return res.writeStatus('401').send('Invalid token sent!');
            // }

            res.writeStatus('200 OK');
            this.addCorsHeaders(res);
            res.writeHeader('Content-Type', 'application/json').end(stringify(
                socketManager.getWorlds(),
                (key: unknown, value: unknown) => {
                    if(value instanceof Map) {
                        const obj: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
                        for (const [mapKey, mapValue] of value.entries()) {
                            obj[mapKey] = mapValue;
                        }
                        return obj;
                    } else if(value instanceof Set) {
                            const obj: Array<unknown> = [];
                            for (const [setKey, setValue] of value.entries()) {
                                obj.push(setValue);
                            }
                            return obj;
                    } else {
                        return value;
                    }
                }
            ));
        });
    }
}
