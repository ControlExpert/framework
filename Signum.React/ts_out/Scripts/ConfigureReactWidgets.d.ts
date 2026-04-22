import * as moment from "moment";
export declare function configure(): void;
declare module "moment" {
    interface Moment {
        fromUserInterface(this: moment.Moment): moment.Moment;
        toUserInterface(this: moment.Moment): moment.Moment;
    }
    function smartNow(this: moment.Moment): moment.Moment;
    interface Duration {
        format(template?: string, precision?: string, settings?: any): string;
    }
}
export declare function asumeGlobalUtcMode(m: typeof moment, utcMode: boolean): void;
//# sourceMappingURL=ConfigureReactWidgets.d.ts.map