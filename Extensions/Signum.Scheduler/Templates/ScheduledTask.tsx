import * as React from 'react'
import { ValueLine, EntityLine, EntityDetail, FindOptionsAutocompleteConfig } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import { ScheduledTaskEntity, ScheduledTaskLogEntity } from '../Signum.Scheduler'
import { SearchValueLine } from '@framework/Search';

export default function ScheduledTask(p : { ctx: TypeContext<ScheduledTaskEntity> }){
  const ctx = p.ctx;

  return (
    <div>
      <EntityLine ctx={ctx.subCtx(f => f.task)} create={false} />
      <EntityDetail ctx={ctx.subCtx(f => f.rule)} />
      <EntityLine ctx={ctx.subCtx(f => f.user)} />
      {!ctx.value.isNew && <ValueLine ctx={ctx.subCtx(f => f.machineName)} />}
      {!ctx.value.isNew && <ValueLine ctx={ctx.subCtx(f => f.applicationName)} />}
      <ValueLine ctx={ctx.subCtx(f => f.suspended)} />
      {!ctx.value.isNew && <SearchValueLine ctx={ctx} findOptions={{
        queryName: ScheduledTaskLogEntity,
        filterOptions: [{ token: ScheduledTaskLogEntity.token(a => a.scheduledTask), value: ctx.value }]
      }} />
      }
    </div>
  );
}

