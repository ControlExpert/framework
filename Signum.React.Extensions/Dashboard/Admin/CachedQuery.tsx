
import * as React from 'react'
import { ValueLine, EntityLine, EntityRepeater, EntityTable, EntityStrip } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import { ValueUserQueryListPartEntity, ValueUserQueryElementEmbedded, DashboardEntity, CachedQueryEntity } from '../Signum.Entities.Dashboard'
import { IsQueryCachedLine } from './Dashboard';
import * as FilesClient from '../../Files/FilesClient';
import { downloadFile } from '../../Files/FileDownloader';
import * as Services from '../../../Signum.React/Scripts/Services';
import { useAPI } from '../../../Signum.React/Scripts/Hooks';
import { FormatJson } from '../../../Signum.React/Scripts/Exceptions/Exception';
import { FileLine } from '../../Files/FileLine';
import { JavascriptMessage } from '@framework/Signum.Entities';

export default function CachedQueryView(p: { ctx: TypeContext<CachedQueryEntity> }) {
  
  const ctx = p.ctx;

  const text = useAPI(() => downloadFile(p.ctx.value.file).then(res => res.text()), [p.ctx.value.file]);

  return (
    <div>
      <EntityLine ctx={ctx.subCtx(a => a.dashboard)} />
      <EntityStrip ctx={ctx.subCtx(a => a.userAssets)} />
      <ValueLine ctx={ctx.subCtx(a => a.creationDate)} />
      <div className="row">
        <div className="col-sm-6">
          <ValueLine ctx={ctx.subCtx(a => a.queryDuration)} labelColumns={4}/>
        </div>
        <div className="col-sm-6">
          <ValueLine ctx={ctx.subCtx(a => a.queryDuration)} labelColumns={4}/>
        </div>
      </div>
      <FileLine ctx={ctx.subCtx(a => a.file)} />
      {text == null ? JavascriptMessage.loading.niceToString() : <FormatJson code={text} />}
    </div>
  );
}
