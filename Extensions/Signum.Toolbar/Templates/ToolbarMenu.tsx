import * as React from 'react'
import { AutoLine, EntityRepeater, EntityLine } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import { ToolbarMenuEntity } from '../Signum.Toolbar'
import { ToolbarElementTable } from './Toolbar';

export default function ToolbarMenu(p : { ctx: TypeContext<ToolbarMenuEntity> }){
  const ctx = p.ctx;

  return (
    <div>
      <AutoLine ctx={ctx.subCtx(f => f.name)} />
      <EntityLine ctx={ctx.subCtx(f => f.owner)} />
      <ToolbarElementTable ctx={ctx.subCtx(m => m.elements)} />
    </div>
  );
}
