import { ModelState } from './Signum.Entities';
export interface AjaxOptions {
    url: string;
    avoidNotifyPendingRequests?: boolean;
    avoidThrowError?: boolean;
    avoidGraphExplorer?: boolean;
    avoidAuthToken?: boolean;
    avoidVersionCheck?: boolean;
    headers?: {
        [index: string]: string;
    };
    mode?: string;
    credentials?: RequestCredentials;
    cache?: string;
    signal?: AbortSignal;
}
export declare function baseUrl(options: AjaxOptions): string;
export declare function ajaxGet<T>(options: AjaxOptions): Promise<T>;
export declare function ajaxGetRaw(options: AjaxOptions): Promise<Response>;
export declare function ajaxPost<T>(options: AjaxOptions, data: any): Promise<T>;
export declare function ajaxPostRaw(options: AjaxOptions, data: any): Promise<Response>;
export declare function wrapRequest(options: AjaxOptions, makeCall: () => Promise<Response>): Promise<Response>;
export declare module AuthTokenFilter {
    let addAuthToken: (options: AjaxOptions, makeCall: () => Promise<Response>) => Promise<Response>;
}
export declare module VersionFilter {
    let initialVersion: string | undefined;
    let latestVersion: string | undefined;
    let versionHasChanged: () => void;
    function onVersionFilter(makeCall: () => Promise<Response>): Promise<Response>;
}
export declare module NotifyPendingFilter {
    let notifyPendingRequests: (pendingRequests: number) => void;
    function onPendingRequest(makeCall: () => Promise<Response>): Promise<Response>;
}
export declare module ThrowErrorFilter {
    function throwError(makeCall: () => Promise<Response>): Promise<Response>;
}
export declare function saveFile(response: Response): void;
export declare function saveFileBlob(blob: Blob, fileName: string): void;
export declare function b64toBlob(b64Data: string, contentType?: string, sliceSize?: number): Blob;
export declare class ServiceError {
    httpError: WebApiHttpError;
    constructor(httpError: WebApiHttpError);
    readonly defaultIcon: "clone" | "exclamation-triangle" | "lock" | "trash";
    toString(): string | null;
}
export interface WebApiHttpError {
    exceptionType: string;
    exceptionMessage: string | null;
    stackTrace: string | null;
    exceptionId: string | null;
    innerException: WebApiHttpError | null;
}
export declare class ValidationError {
    modelState: ModelState;
    constructor(modelState: ModelState);
}
export declare namespace SessionSharing {
    let avoidSharingSession: boolean;
    function getAppName(): string;
    function setAppNameAndRequestSessionStorage(appName: string): void;
}
export declare class AbortableRequest<Q, A> {
    makeCall: (signal: AbortSignal, query: Q) => Promise<A>;
    private requestIndex;
    private abortController?;
    constructor(makeCall: (signal: AbortSignal, query: Q) => Promise<A>);
    abort(): boolean;
    isRunning(): boolean;
    getData(query: Q): Promise<A>;
}
//# sourceMappingURL=Services.d.ts.map