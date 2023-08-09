import * as React from 'react'
import { DomUtils, Dic } from '@framework/Globals'
import * as Finder from '@framework/Finder'
import * as Navigator from '@framework/Navigator'
import { FilterOptionParsed, ColumnOption, hasAggregate, withoutAggregate, FilterOption, FindOptions, withoutPinned } from '@framework/FindOptions'
import { ChartRequestModel, ChartMessage } from '../Signum.Entities.Chart'
import * as ChartClient from '../ChartClient'
import { toFilterOptions } from '@framework/Finder';

import "../Chart.css"
import { ChartScript, ChartRow } from '../ChartClient';
import { ErrorBoundary } from '@framework/Components';

import ReactChart from '../D3Scripts/Components/ReactChart';
import { useAPI } from '@framework/Hooks'
import { TypeInfo } from '@framework/Reflection'
import { FullscreenComponent } from './FullscreenComponent'
import { DashboardFilter } from '../../Dashboard/View/DashboardFilterController'


export interface ChartRendererProps {
  chartRequest: ChartRequestModel;
  loading: boolean;

  data?: ChartClient.ChartTable;
  lastChartRequest?: ChartRequestModel;
  onReload?: (e?: React.MouseEvent<any>) => void;
  autoRefresh: boolean;
  onCreateNew?: (e: React.MouseEvent<any>) => void;
  typeInfos?: TypeInfo[];
  dashboardFilter?: DashboardFilter;
  onDrillDown?: (row: ChartRow, e: React.MouseEvent | MouseEvent) => void;
  onBackgroundClick?: (e: React.MouseEvent) => void;
}

export default function ChartRenderer(p: ChartRendererProps) {
  const cs = useAPI(async signal => {
    const chartScriptPromise = ChartClient.getChartScript(p.chartRequest.chartScript);
    const chartComponentModulePromise = ChartClient.getRegisteredChartScriptComponent(p.chartRequest.chartScript);

    const chartScript = await chartScriptPromise;
    const chartComponentModule = await chartComponentModulePromise();

    return { chartComponent: chartComponentModule.default, chartScript };
  }, [p.chartRequest.chartScript]);

  var parameters = cs && ChartClient.API.getParameterWithDefault(p.chartRequest, cs.chartScript)

  return (
    <FullscreenComponent onReload={p.onReload} onCreateNew={p.onCreateNew} typeInfos={p.typeInfos}>
      <ErrorBoundary deps={[p.data]}>
        {cs && parameters &&
          <ReactChart
            chartRequest={p.chartRequest}
            data={p.data}
            dashboardFilter={p.dashboardFilter}
            loading={p.loading}
            onDrillDown={p.onDrillDown ?? ((r, e) => handleDrillDown(r, e, p.lastChartRequest!, p.autoRefresh ? p.onReload : undefined))}
            onBackgroundClick={p.onBackgroundClick}
            parameters={parameters}
            onReload={p.onReload}
            onRenderChart={cs.chartComponent as ((p: ChartClient.ChartScriptProps) => React.ReactNode)} />
        }
      </ErrorBoundary>
    </FullscreenComponent>
  );
}

export function handleDrillDown(r: ChartRow, e: React.MouseEvent | MouseEvent, cr: ChartRequestModel, onReload?: () => void) {

  e.stopPropagation();
  var newWindow = e.ctrlKey || e.button == 1;

  if (r.entity) {
    if (newWindow)
      window.open(Navigator.navigateRoute(r.entity));
    else
      Navigator.view(r.entity)
        .then(() => onReload && onReload())
        .done();
  } else {
    const filters = cr.filterOptions.map(f => {
      let f2 = withoutPinned(f);
      if (f2 == null)
        return null;
      return withoutAggregate(f2);
    }).notNull();

    const columns: ColumnOption[] = [];

    cr.columns.map((a, i) => {

      const t = a.element.token;

      if (t?.token && !hasAggregate(t!.token!) && r.hasOwnProperty("c" + i)) {
        filters.push({
          token: t!.token!,
          operation: "EqualTo",
          value: (r as any)["c" + i],
          frozen: false
        } as FilterOptionParsed);
      }

      if (t?.token && t.token.parent != undefined) //Avoid Count and simple Columns that are already added
      {
        var token = t.token.queryTokenType == "Aggregate" ? t.token.parent : t.token

        if (token.parent || t.token.queryTokenType == "Aggregate")
          columns.push({
            token: token.fullKey,
            summaryToken: t.token.queryTokenType == "Aggregate" ? t.token.fullKey : undefined,
          });
      }
    });

    var fo: FindOptions = {
      queryName: cr.queryKey,
      filterOptions: toFilterOptions(filters),
      includeDefaultFilters: false,
      columnOptions: columns,
      columnOptionsMode: "InsertStart",
    };

    if (newWindow)
      window.open(Finder.findOptionsPath(fo));
    else
      Finder.explore(fo)
        .then(() => onReload && onReload())
        .done();
  }
}
