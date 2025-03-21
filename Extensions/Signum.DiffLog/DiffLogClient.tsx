import { RouteObject } from 'react-router'
import { ajaxGet } from '@framework/Services';
import { EntitySettings } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import { Lite } from '@framework/Signum.Entities'
import { OperationLogEntity } from '@framework/Signum.Operations'
import * as AuthAdminClient from '../Signum.Authorization/AuthAdminClient'
import { OperationLogTypeCondition } from './Signum.DiffLog';
import { registerChangeLogModule } from '@framework/Basics/ChangeLogClient';


export function start(options: { routes: RouteObject[] }) {

  registerChangeLogModule("Signum.DiffLog", () => import("./Changelog"));

  Navigator.addSettings(new EntitySettings(OperationLogEntity, e => import('./Templates/OperationLog')));
  AuthAdminClient.registerQueryAuditorToken(OperationLogEntity, OperationLogEntity.token(a => a.target), OperationLogTypeCondition.FilteringByTarget);
}

export namespace API {

  export function getPreviousOperationLog(id: string | number): Promise<PreviousLog> {
    return ajaxGet({ url: "/api/diffLog/previous/" + id });
  }

  export function getNextOperationLog(id: string | number): Promise<NextLog> {
    return ajaxGet({ url: "/api/diffLog/next/" + id });
  }
}

export interface PreviousLog {
  operationLog: Lite<OperationLogEntity>;
  dump: string;
}

export interface NextLog {
  operationLog?: Lite<OperationLogEntity>;
  dump: string;
}
