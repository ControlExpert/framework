//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from './Reflection'
import * as Entities from './Signum.Entities'
import * as Security from './Signum.Security'
import * as Operations from './Signum.Operations'


export const BootstrapStyle = new EnumType<BootstrapStyle>("BootstrapStyle");
export type BootstrapStyle =
  "Light" |
  "Dark" |
  "Primary" |
  "Secondary" |
  "Success" |
  "Info" |
  "Warning" |
  "Danger";

export const ClientErrorModel = new Type<ClientErrorModel>("ClientErrorModel");
export interface ClientErrorModel extends Entities.ModelEntity {
  Type: "ClientErrorModel";
  errorType: string;
  message: string;
  stack: string | null;
  name: string | null;
}

export module CollapsableCardMessage {
  export const Collapse = new MessageKey("CollapsableCardMessage", "Collapse");
  export const Expand = new MessageKey("CollapsableCardMessage", "Expand");
}

export const CultureInfoEntity = new Type<CultureInfoEntity>("CultureInfo");
export interface CultureInfoEntity extends Entities.Entity {
  Type: "CultureInfo";
  name: string;
  nativeName: string;
  englishName: string;
}

export module CultureInfoOperation {
  export const Save : Operations.ExecuteSymbol<CultureInfoEntity> = registerSymbol("Operation", "CultureInfoOperation.Save");
  export const Delete : Operations.DeleteSymbol<CultureInfoEntity> = registerSymbol("Operation", "CultureInfoOperation.Delete");
}

export const DeleteLogParametersEmbedded = new Type<DeleteLogParametersEmbedded>("DeleteLogParametersEmbedded");
export interface DeleteLogParametersEmbedded extends Entities.EmbeddedEntity {
  Type: "DeleteLogParametersEmbedded";
  deleteLogs: Entities.MList<DeleteLogsTypeOverridesEmbedded>;
  chunkSize: number;
  maxChunks: number;
  pauseTime: number | null;
}

export const DeleteLogsTypeOverridesEmbedded = new Type<DeleteLogsTypeOverridesEmbedded>("DeleteLogsTypeOverridesEmbedded");
export interface DeleteLogsTypeOverridesEmbedded extends Entities.EmbeddedEntity {
  Type: "DeleteLogsTypeOverridesEmbedded";
  type: Entities.Lite<TypeEntity>;
  deleteLogsOlderThan: number | null;
  deleteLogsWithExceptionsOlderThan: number | null;
}

export module DisabledMessage {
  export const ParentIsDisabled = new MessageKey("DisabledMessage", "ParentIsDisabled");
}

export const DisabledMixin = new Type<DisabledMixin>("DisabledMixin");
export interface DisabledMixin extends Entities.MixinEntity {
  Type: "DisabledMixin";
  isDisabled: boolean;
}

export module DisableOperation {
  export const Disable : Operations.ExecuteSymbol<Entities.Entity> = registerSymbol("Operation", "DisableOperation.Disable");
  export const Enabled : Operations.ExecuteSymbol<Entities.Entity> = registerSymbol("Operation", "DisableOperation.Enabled");
}

export const ExceptionEntity = new Type<ExceptionEntity>("Exception");
export interface ExceptionEntity extends Entities.Entity {
  Type: "Exception";
  creationDate: string /*DateTime*/;
  exceptionType: string | null;
  exceptionMessage: string;
  exceptionMessageHash: number;
  stackTrace: Entities.BigStringEmbedded;
  stackTraceHash: number;
  threadId: number;
  user: Entities.Lite<Security.IUserEntity> | null;
  environment: string | null;
  version: string | null;
  userAgent: string | null;
  requestUrl: string | null;
  controllerName: string | null;
  actionName: string | null;
  urlReferer: string | null;
  machineName: string | null;
  applicationName: string | null;
  userHostAddress: string | null;
  userHostName: string | null;
  form: Entities.BigStringEmbedded;
  queryString: Entities.BigStringEmbedded;
  session: Entities.BigStringEmbedded;
  data: Entities.BigStringEmbedded;
  hResult: number;
  referenced: boolean;
  origin: ExceptionOrigin;
}

export const ExceptionOrigin = new EnumType<ExceptionOrigin>("ExceptionOrigin");
export type ExceptionOrigin =
  "Backend_DotNet" |
  "Frontend_React";

export interface IEmailOwnerEntity extends Entities.Entity {
}

export const PermissionSymbol = new Type<PermissionSymbol>("Permission");
export interface PermissionSymbol extends Symbol {
  Type: "Permission";
}

export const PropertyRouteEntity = new Type<PropertyRouteEntity>("PropertyRoute");
export interface PropertyRouteEntity extends Entities.Entity {
  Type: "PropertyRoute";
  path: string;
  rootType: TypeEntity;
}

export const QueryEntity = new Type<QueryEntity>("Query");
export interface QueryEntity extends Entities.Entity {
  Type: "Query";
  key: string;
}

export interface SemiSymbol extends Entities.Entity {
  key: string | null;
  name: string;
}

export interface Symbol extends Entities.Entity {
  key: string;
}

export const SystemEventLogEntity = new Type<SystemEventLogEntity>("SystemEventLog");
export interface SystemEventLogEntity extends Entities.Entity {
  Type: "SystemEventLog";
  machineName: string;
  date: string /*DateTime*/;
  user: Entities.Lite<Security.IUserEntity> | null;
  eventType: string;
  exception: Entities.Lite<ExceptionEntity> | null;
}

export const TranslateableRouteType = new EnumType<TranslateableRouteType>("TranslateableRouteType");
export type TranslateableRouteType =
  "Text" |
  "Html";

export const TypeEntity = new Type<TypeEntity>("Type");
export interface TypeEntity extends Entities.Entity {
  Type: "Type";
  tableName: string;
  cleanName: string;
  namespace: string;
  className: string;
}

