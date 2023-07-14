import * as React from 'react'
import { ValueLine, EntityRepeater, EntityTable } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import { HolidayCalendarEntity, HolidayEmbedded } from '../Signum.Entities.Scheduler'

export default function HolidayCalendar(p : { ctx: TypeContext<HolidayCalendarEntity> }){
  const e = p.ctx;

  return (
    <div>
      <ValueLine ctx={e.subCtx(f => f.name)} />
      <div>
        <EntityTable ctx={e.subCtx(f => f.holidays)} columns={EntityTable.typedColumns<HolidayEmbedded>([
          { property: a => a.date },
          { property: a => a.name },
        ])} />
      </div>
    </div>
  );
}

