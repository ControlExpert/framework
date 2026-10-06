import * as React from 'react'
import { Navigator } from '@framework/Navigator'
import { Finder } from '@framework/Finder'
import { AutoLine, EntityLine, EnumLine } from '@framework/Lines'
import { Lite, is } from '@framework/Signum.Entities'
import { TypeContext } from '@framework/TypeContext'
import { useAPI, useForceUpdate } from '@framework/Hooks'
import { EmaiTemplateTargetFrom, SendEmailTaskEntity } from './Signum.Mailing.Package'
import { UserQueryEntity } from '../../Signum.UserQueries/Signum.UserQueries'

export default function SendEmailTask(p: { ctx: TypeContext<SendEmailTaskEntity> }): React.JSX.Element {

  const forceUpdate = useForceUpdate();

  const pair = useAPI(async () => {
    if (p.ctx.value.emailTemplate == null)
      return null;

    var et = await Navigator.API.fetch(p.ctx.value.emailTemplate);

    if (et.query == null)
      return { query: null };

    var qd = await Finder.getQueryDescription(et.query!.key);
    return {
      query: et.query,
      type: qd.columns["Entity"].type.name
    };
  }, [p.ctx.value.emailTemplate]);

  React.useEffect(() => {
    // COM-9010: pair is undefined while useAPI is still loading — distinct from a resolved
    // { query: null } (template genuinely has no query). Without this guard, every mount briefly
    // forces targetFrom to NoTarget and back, marking the entity modified on every open even
    // without user interaction (blocks Execute with a permanent "must save" loop).
    if (pair === undefined) {
      return;
    }

    // COM-9010: go through the binding's setValue (same path EnumLine itself uses) instead of
    // mutating p.ctx.value directly — it compares old/new value and sets modified accordingly,
    // so Save actually persists the correction instead of silently keeping the stale DB state.
    const targetFromCtx = p.ctx.subCtx(s => s.targetFrom);

    if (pair?.type) {
      if (p.ctx.value.targetFrom == "NoTarget") {
        // COM-9010: Respect an already-set targetsFromUserQuery/uniqueTarget instead of
        // always defaulting to "Unique" — otherwise legacy records with TargetFrom stuck
        // on "NoTarget" show as "Unique" with an empty target and hide the real value.
        targetFromCtx.value = p.ctx.value.targetsFromUserQuery != null ? "UserQuery" : "Unique";
        forceUpdate();
      }
    } else {
      if (p.ctx.value.targetFrom != "NoTarget") {
        targetFromCtx.value = "NoTarget";
        forceUpdate();
      }
    }

  }, [pair])

  const sc = p.ctx.subCtx({ formGroupStyle: "Basic" });

  return (
    <div>
      <AutoLine ctx={sc.subCtx(s => s.name)} />
      <EntityLine ctx={sc.subCtx(s => s.emailTemplate)}
        onChange={() => { p.ctx.value.targetsFromUserQuery = null; p.ctx.value.uniqueTarget = null; forceUpdate(); }}
        helpText={pair && ("Query: " + (pair.query?.key ?? "null") + (pair.query?.key != pair.type ? ` (${pair.type})` : ""))} />

      <div className="row">
        <div className="col-sm-6">
          {sc.value.emailTemplate && <EnumLine ctx={sc.subCtx(s => s.targetFrom)}
            onChange={() => { p.ctx.value.targetsFromUserQuery = null; p.ctx.value.uniqueTarget = null; forceUpdate(); }}
            optionItems={pair?.type == null ? [EmaiTemplateTargetFrom.value("NoTarget")] : [EmaiTemplateTargetFrom.value("Unique"), EmaiTemplateTargetFrom.value("UserQuery")]} />}
        </div>
        <div className="col-sm-6">
          {pair?.type && sc.value.targetFrom == "UserQuery" && <EntityLine ctx={sc.subCtx(s => s.targetsFromUserQuery)} findOptions={{ queryName: UserQueryEntity, filterOptions: [{ token: UserQueryEntity.token(a => a.query.key), value: pair.type! }] }} />}
          {pair?.type && sc.value.targetFrom == "Unique" && <EntityLine ctx={sc.subCtx(s => s.uniqueTarget)} type={{ isLite: true, name: pair.type! }} />}
        </div>
      </div>
    </div>
  );
}

