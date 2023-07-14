import * as React from 'react'
import { CaseTagsModel, CaseTagTypeEntity } from '../Signum.Entities.Workflow'
import { EntityStrip, TypeContext } from '@framework/Lines'
import Tag from './Tag'

export default function CaseTagsModelComponent(p : { ctx: TypeContext<CaseTagsModel> }){
  var ctx = p.ctx;
  return (
    <EntityStrip ctx={ctx.subCtx(a => a.caseTags)}
      onItemHtmlAttributes={tag => ({ style: { textDecoration: "none" } })}
      onRenderItem={tag => <Tag tag={tag as CaseTagTypeEntity} />}
    />
  );
}
