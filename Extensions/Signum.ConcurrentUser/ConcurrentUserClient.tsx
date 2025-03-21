import * as React from 'react'
import { RouteObject } from 'react-router'
import { ConcurrentUserEntity } from './Signum.ConcurrentUser'
import { Entity, isEntity, Lite, toLite } from '@framework/Signum.Entities'
import * as Navigator from '@framework/Navigator'
import * as Widgets from '@framework/Frames/Widgets';
import ConcurrentUser from './ConcurrentUser'
import { ajaxGet } from '@framework/Services'
import { UserEntity } from '../Signum.Authorization/Signum.Authorization';
import { getTypeInfo, TypeInfo } from '@framework/Reflection'
import { registerChangeLogModule } from '@framework/Basics/ChangeLogClient'

export function start(options: { routes: RouteObject[], activatedFor?: (e: Entity) => boolean }) {

  registerChangeLogModule("Signum.ConcurrentUser", () => import("./Changelog"));

  //Keep in sync with ConcurrentUserLogic activatedFor!
  const activatedFor = options.activatedFor ?? (e => {
    const ti = getTypeInfo(e.Type);

    return !(ti.entityKind == "System" || ti.entityKind == "SystemString");
  });

  Widgets.onWidgets.push(ctx => {

    var me = ctx.ctx.value;

    if (isEntity(me) && !me.isNew && activatedFor(me)) {
      const entity = me;
      return <ConcurrentUser entity={entity} onReload={() =>
        Navigator.API.fetchEntityPack(toLite(entity))
          .then(pack => ctx.frame.onReload(pack))} />;
    }

    return undefined;
  });
}

export module API {
  export function getUsers(key: string): Promise<ConcurrentUserResponse[]> {
    return ajaxGet({ url: "/api/concurrentUser/getUsers/" + key});
  }
}

export interface ConcurrentUserResponse {
  user : Lite<UserEntity>;
  startTime : string /*DateTime*/;
  connectionID: string;
  isModified: boolean;
}
