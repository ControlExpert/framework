import { Type } from './Reflection';
import * as Entities from './Signum.Entities';
export declare const ColorEmbedded: Type<ColorEmbedded>;
export interface ColorEmbedded extends Entities.EmbeddedEntity {
    Type: "ColorEmbedded";
    argb?: number;
}
export declare const DeleteLogParametersEmbedded: Type<DeleteLogParametersEmbedded>;
export interface DeleteLogParametersEmbedded extends Entities.EmbeddedEntity {
    Type: "DeleteLogParametersEmbedded";
    deleteLogs: Entities.MList<DeleteLogsTypeOverridesEmbedded>;
    chunkSize?: number;
    maxChunks?: number;
    pauseTime?: number | null;
}
export declare const DeleteLogsTypeOverridesEmbedded: Type<DeleteLogsTypeOverridesEmbedded>;
export interface DeleteLogsTypeOverridesEmbedded extends Entities.EmbeddedEntity {
    Type: "DeleteLogsTypeOverridesEmbedded";
    type?: Entities.Lite<TypeEntity> | null;
    deleteLogsWithMoreThan?: number | null;
    cleanLogsWithMoreThan?: number | null;
}
export declare const ExceptionEntity: Type<ExceptionEntity>;
export interface ExceptionEntity extends Entities.Entity {
    Type: "Exception";
    creationDate?: string;
    exceptionType?: string | null;
    exceptionMessage?: string | null;
    exceptionMessageHash?: number;
    stackTrace?: string | null;
    stackTraceHash?: number;
    threadId?: number;
    user?: Entities.Lite<IUserEntity> | null;
    environment?: string | null;
    version?: string | null;
    userAgent?: string | null;
    requestUrl?: string | null;
    controllerName?: string | null;
    actionName?: string | null;
    urlReferer?: string | null;
    machineName?: string | null;
    applicationName?: string | null;
    userHostAddress?: string | null;
    userHostName?: string | null;
    form?: string | null;
    queryString?: string | null;
    session?: string | null;
    data?: string | null;
    hResult?: number;
    referenced?: boolean;
}
export interface IUserEntity extends Entities.Entity {
}
export declare const OperationLogEntity: Type<OperationLogEntity>;
export interface OperationLogEntity extends Entities.Entity {
    Type: "OperationLog";
    target: Entities.Lite<Entities.Entity> | null;
    origin: Entities.Lite<Entities.Entity> | null;
    operation: Entities.OperationSymbol;
    user: Entities.Lite<IUserEntity>;
    start: string;
    end: string | null;
    exception: Entities.Lite<ExceptionEntity> | null;
}
export declare const PropertyRouteEntity: Type<PropertyRouteEntity>;
export interface PropertyRouteEntity extends Entities.Entity {
    Type: "PropertyRoute";
    path: string;
    rootType: TypeEntity;
}
export declare const QueryEntity: Type<QueryEntity>;
export interface QueryEntity extends Entities.Entity {
    Type: "Query";
    key: string;
}
export interface SemiSymbol extends Entities.Entity {
    key?: string | null;
    name?: string | null;
}
export declare const TypeEntity: Type<TypeEntity>;
export interface TypeEntity extends Entities.Entity {
    Type: "Type";
    tableName: string;
    cleanName: string;
    namespace: string;
    className: string;
}
//# sourceMappingURL=Signum.Entities.Basics.d.ts.map