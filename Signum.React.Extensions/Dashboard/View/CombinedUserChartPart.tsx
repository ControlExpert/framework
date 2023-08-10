import * as React from 'react'
import { ServiceError } from '@framework/Services'
import * as Finder from '@framework/Finder'
import * as Navigator from '@framework/Navigator'
import * as Constructor from '@framework/Constructor'
import { Entity, Lite, is, JavascriptMessage } from '@framework/Signum.Entities'
import * as UserChartClient from '../../Chart/UserChart/UserChartClient'
import * as ChartClient from '../../Chart/ChartClient'
import { ChartRequestModel, UserChartEntity } from '../../Chart/Signum.Entities.Chart'
import ChartRenderer from '../../Chart/Templates/ChartRenderer'
import ChartTableComponent from '../../Chart/Templates/ChartTable'
import { CombinedUserChartPartEntity, UserChartPartEntity } from '../Signum.Entities.Dashboard'
import PinnedFilterBuilder from '@framework/SearchControl/PinnedFilterBuilder';
import { useAPI, useAPIWithReload, useForceUpdate, useSize, useThrottle } from '@framework/Hooks'
import { PanelPartContentProps } from '../DashboardClient'
import SelectorModal from '@framework/SelectorModal'
import { QueryDescription } from '@framework/FindOptions'
import { ErrorBoundary } from '@framework/Components'
import ChartRendererCombined from '../../Chart/Templates/ChartRendererCombined'
import { MemoRepository } from '../../Chart/D3Scripts/Components/ReactChart'


export interface CombinedUserChartInfoTemp {
  userChart: UserChartEntity;
  chartScript?: ChartClient.ChartScript;
  parameters?: { [parameter: string]: string } | undefined;
  chartRequest?: ChartRequestModel;
  memo: MemoRepository;
  result?: ChartClient.API.ExecuteChartResult;
  makeQuery?: () => Promise<void>;
  error?: any;
}

export default function CombinedUserChartPart(p: PanelPartContentProps<CombinedUserChartPartEntity>) {

  const forceUpdate = useForceUpdate();

  const infos = React.useMemo<CombinedUserChartInfoTemp[]>(() => p.part.userCharts.map(uc => ({ userChart: uc.element } as CombinedUserChartInfoTemp)), [p.part]);

  const [showData, setShowData] = React.useState(p.part.showData);

  

  React.useEffect(() => {
    var abortController = new AbortController();
    const signal = abortController.signal;

    infos.forEach(c => {

      UserChartClient.Converter.toChartRequest(c.userChart, p.entity)
        .then(chartRequest => {
          c.chartRequest = chartRequest;
          var originalFilters = chartRequest.filterOptions.length;
          c.memo = new MemoRepository();
          forceUpdate();
          if (!signal.aborted) {

            ChartClient.getChartScript(c.chartRequest.chartScript)
              .then(cr => {
                c.chartScript = cr;
                forceUpdate();

                c.makeQuery = () => {

                  if (chartRequest != null) {
                    chartRequest.filterOptions.splice(originalFilters);
                    chartRequest.filterOptions.push(
                      ...p.filterController.getFilterOptions(p.partEmbedded, chartRequest!.queryKey),
                    );
                  }

                  return ChartClient.API.executeChart(chartRequest!, c.chartScript!, signal)
                    .then(result => {
                      if (!signal.aborted) {
                        c.result = result;
                        forceUpdate();
                      }
                    })
                    .catch(error => {
                      if (!signal.aborted) {
                        c.error = error;
                        forceUpdate();
                      }
                    });
                };

                return c.makeQuery();
              }).done();
          }
        }).done();
    });

    return () => {
      abortController.abort();
    };

  }, [p.part, ...p.deps ?? [], infos.max(e => p.filterController.lastChange.get(e.userChart.query.key))]);


  function renderError(e: any, key: number) {
    const se = e instanceof ServiceError ? (e as ServiceError) : undefined;

    if (se == undefined)
      return <p className="text-danger" key={key}> {e.message ? e.message : e}</p>;

    return (
      <div>
        {se.httpError.exceptionMessage && <p className="text-danger" key={key}>{se.httpError.exceptionMessage}</p>}
      </div>
    );

  }

  if (infos.some(a => a.chartRequest == null || a.chartScript == null))
    return <span>{JavascriptMessage.loading.niceToString()}</span>;

  if (infos.some(a => a.error != null)) {
    return (
      <div>
        <h4>Error!</h4>
        {
          infos
            .filter(m => m.error != null)
            .map((m, i) => renderError(m.error, i))
        }
      </div>
    );
  }

  return (
    <div>
      {infos.map((info, i) => <PinnedFilterBuilder key={i}
        filterOptions={info.chartRequest!.filterOptions}
        onFiltersChanged={() => info.makeQuery!()} extraSmall={true} />
      )}
      {p.part.allowChangeShowData &&
        <label>
          <input type="checkbox" className="form-check-input" checked={showData} onChange={e => setShowData(e.currentTarget.checked)} />
        {" "}{CombinedUserChartPartEntity.nicePropertyName(a => a.showData)}
        </label>}
      {showData ?
        infos.map((c, i) => c.result == null ? <span key={i}>{JavascriptMessage.loading.niceToString()}</span> :
          <ChartTableComponent
            chartRequest={c.chartRequest!}
            lastChartRequest={c.chartRequest!}
            resultTable={c.result.resultTable!}
            onOrderChanged={() => c.makeQuery!()}
            onReload={e => { e.preventDefault(); c.makeQuery!(); }}
          />) :
        <ChartRendererCombined
          infos={infos.map(c => ({ chartRequest: c.chartRequest!, data: c.result?.chartTable, chartScript: c.chartScript!, memo: c.memo }))}
          onReload={e => { infos.forEach(a => a.makeQuery!()) }}
          useSameScale={p.part.useSameScale}
        />
      }
    </div>
  );
}

