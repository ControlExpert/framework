import * as React from 'react'
import { RouteObject } from 'react-router'
import { Navigator, EntitySettings } from '@framework/Navigator'
import { SearchControl, SearchValueLine } from '@framework/Search'
import { Finder } from '@framework/Finder'
import { Constructor } from '@framework/Constructor'
import { EvalClient } from '../Signum.Eval/EvalClient'
import { DynamicApiEntity, DynamicApiEval } from './Signum.Dynamic.Controllers'

export namespace DynamicApiClient {
  
  export function start(options: { routes: RouteObject[] }): void {
    Navigator.addSettings(new EntitySettings(DynamicApiEntity, w => import('./Api/DynamicApi')));
    Constructor.registerConstructor(DynamicApiEntity, () => DynamicApiEntity.New({ eval: DynamicApiEval.New() }));
    EvalClient.Options.onGetDynamicLineForPanel.push(ctx => <SearchValueLine ctx={ctx} findOptions={{ queryName: DynamicApiEntity }} />);
    EvalClient.Options.registerDynamicPanelSearch(DynamicApiEntity, t => [
      { token: t.append(p => p.name), type: "Text" },
      { token: t.append(p => p.entity.eval!.script), type: "Code" },
    ]);
      
  }
}
