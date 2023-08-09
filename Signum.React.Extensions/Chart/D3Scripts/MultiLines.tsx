import * as React from 'react'
import * as d3 from 'd3'
import * as ChartClient from '../ChartClient';
import * as ChartUtils from './Components/ChartUtils';
import { translate, scale, rotate, skewX, skewY, matrix, scaleFor } from './Components/ChartUtils';
import { PivotRow, toPivotTable, groupedPivotTable } from './Components/PivotTable';
import { ChartTable, ChartColumn, ChartScriptProps } from '../ChartClient';
import { XKeyTicks, YScaleTicks } from './Components/Ticks';
import Legend from './Components/Legend';
import { XAxis, YAxis } from './Components/Axis';
import { Rule } from './Components/Rule';
import InitialMessage from './Components/InitialMessage';


export default function renderMultiLines({ data, width, height, parameters, loading, onDrillDown, initialLoad, chartRequest, memo, dashboardFilter }: ChartScriptProps): React.ReactElement<any> {

  var xRule = Rule.create({
    _1: 5,
    title: 15,
    _2: 10,
    labels: parseInt(parameters["UnitMargin"]),
    _3: 5,
    ticks: 4,
    content: '*',
    _4: 10,
  }, width);
  //xRule.debugX(chart)

  var yRule = Rule.create({
    _1: 10,
    legend: 15,
    _2: 20,
    content: '*',
    ticks: 4,
    _3: 5,
    labels: 30,
    _4: 10,
    title: 15,
    _5: 5,
  }, height);
  //yRule.debugY(chart);

  if (data == null || data.rows.length == 0)
    return (
      <svg direction="ltr" width={width} height={height}>
        <InitialMessage data={data} x={xRule.middle("content")} y={yRule.middle("content")} loading={loading} />
        <XAxis xRule={xRule} yRule={yRule} />
        <YAxis xRule={xRule} yRule={yRule} />
      </svg>
    );


  var c = data.columns;
  var keyColumn = c.c0 as ChartColumn<unknown>;
  var valueColumn0 = c.c2 as ChartColumn<number>;

  var pivot = c.c1 == null ?
    toPivotTable(data, c.c0!, [c.c2, c.c3, c.c4, c.c5, c.c6].filter(cn => cn != undefined) as ChartColumn<number>[]) :
    groupedPivotTable(data, c.c0!, c.c1, c.c2 as ChartColumn<number>);


  var keyValues = ChartUtils.completeValues(keyColumn, pivot.rows.map(r => r.rowValue), parameters['CompleteValues'], chartRequest.filterOptions, ChartUtils.insertPoint(keyColumn, valueColumn0));

  var x = d3.scaleBand()
    .domain(keyValues.map(v => keyColumn.getKey(v)))
    .range([0, xRule.size('content')]);

  var allValues = pivot.rows.flatMap(r => pivot.columns.map(function (c) { return r.values[c.key]?.value; }));

  var y = scaleFor(valueColumn0, allValues, 0, yRule.size('content'), parameters["Scale"]);

  var columnsInOrder = pivot.columns.orderBy(a => a.key);
  var rowsInOrder = pivot.rows.orderBy(r => keyColumn.getKey(r.rowValue));
  var color = ChartUtils.colorCategory(parameters, columnsInOrder.map(s => s.key), memo);

  var pInterpolate = parameters["Interpolate"];
  var rowByKey = pivot.rows.toObject(r => keyColumn.getKey(r.rowValue));
  var circleRadius = parseFloat(parameters["CircleRadius"]!);
  var circleStroke = parseFloat(parameters["CircleStroke"]!);
  var circleRadiusHover = parseFloat(parameters["CircleRadiusHover"]!);

  var bw = x.bandwidth();
  if (parameters["CircleAutoReduce"]! == "Yes") {

    if (circleRadius > bw / 3)
      circleRadius = bw / 3;

    if (circleRadiusHover > bw / 2)
      circleRadiusHover = bw / 2;

    if (circleStroke > bw / 8)
      circleStroke = bw / 8;
  }

  var numberOpacity = parseFloat(parameters["NumberOpacity"]!);
  if (numberOpacity > 0 && bw < parseFloat(parameters["NumberMinWidth"]!))
    numberOpacity = 0;

  var detector = dashboardFilter?.getActiveDetector(chartRequest);

  return (
    <svg direction="ltr" width={width} height={height}>
      <XKeyTicks xRule={xRule} yRule={yRule} keyValues={keyValues} keyColumn={keyColumn} x={x} isActive={detector && (val => detector!({ c0: val }))} onDrillDown={(v, e) => onDrillDown({ c0: v }, e)} />
      <g opacity={dashboardFilter ? .5 : undefined}>
        <YScaleTicks xRule={xRule} yRule={yRule} valueColumn={valueColumn0} y={y} />
      </g>

      {columnsInOrder.map(s => {

        return (
          <g key={s.key} className="shape-serie-hover sf-transition"
            transform={translate(xRule.start('content') + x.bandwidth() / 2, yRule.end('content'))} >
            <path className="shape sf-transition"
              stroke={s.color || color(s.key)}
              opacity={dashboardFilter && !(c.c1 && detector?.({ c1: s.value }) == true) ? .5 : undefined}
              transform={initialLoad ? scale(1, 0) : scale(1, 1)}
              fill="none"
              strokeWidth={3}
              shapeRendering="initial"
              d={d3.line<PivotRow | undefined>()
                .defined(r => r?.values[s.key]?.value != null)
                .x(r => x(keyColumn.getKey(r!.rowValue))!)
                .y(r => -y(r!.values[s.key].value)!)
                .curve(ChartUtils.getCurveByName(pInterpolate)!)
                (keyValues.map(k => rowByKey[keyColumn.getKey(k)]))!}
            />
            {/*paint graph - hover area trigger*/}
            {circleRadiusHover > 0 && rowsInOrder
              .map(r => {
                var row = r.values[s.key];
                if (row == null)
                  return undefined;

                return (
                  <circle key={keyColumn.getKey(r.rowValue)} className="hover"
                    transform={translate(x(keyColumn.getKey(r.rowValue))!, -y(row.value)!)}
                    r={circleRadiusHover}
                    fill="#fff"
                    fillOpacity={0}
                    stroke="none"
                    onClick={e => onDrillDown(row.rowClick, e)}
                    cursor="pointer">
                    <title>
                      {row.valueTitle}
                    </title>
                  </circle>
                );
              })}
          </g>
        )
      })}

      {
        columnsInOrder.map(s =>
          <g key={s.key} className="shape-serie sf-transition"
            transform={translate(xRule.start('content') + x.bandwidth() / 2, yRule.end('content'))} >
            {/*paint graph - points and texts*/}
            {circleRadius > 0 && circleStroke > 0 && rowsInOrder
              .map(r => {
                var row = r.values[s.key];
                if (row == null)
                  return undefined;

                var active = detector?.(row.rowClick);
                var key = keyColumn.getKey(r.rowValue);

                return (
                  <circle key={key} className="point sf-transition"
                    opacity={active == false ? .5 : undefined}
                    stroke={active == true ? "black" : s.color || color(s.key)}
                    strokeWidth={active == true ? 3 : circleStroke}
                    fill="white"
                    transform={(initialLoad ? scale(1, 0) : scale(1, 1)) + translate(x(key)!, -y(row.value)!)}
                    r={circleRadius}
                    shapeRendering="initial"
                    onClick={e => onDrillDown(row.rowClick, e)}
                    cursor="pointer">
                    <title>
                      {row.valueTitle}
                    </title>
                  </circle>
                );
              })}
            {numberOpacity > 0 &&
              rowsInOrder
                .map(r => {

                  var row = r.values[s.key];
                  if (row == null)
                    return undefined;

                  var active = detector?.(row.rowClick);
                  return (
                    <text key={keyColumn.getKey(r.rowValue)} className="point-label sf-transition"
                      textAnchor="middle"
                      opacity={active == false ? .5 : active == true ? 1 : numberOpacity}
                      transform={translate(x(keyColumn.getKey(r.rowValue))!, -y(row.value)! - 8)}
                      onClick={e => onDrillDown(row.rowClick, e)}
                      cursor="pointer"
                      shapeRendering="initial">
                      {row.valueNiceName}
                    </text>
                  );
                })
            }
          </g>
        )
      }

      <Legend pivot={pivot} xRule={xRule} yRule={yRule} color={color} isActive={c.c1 && detector && (row => detector!({ c1: row.value }))} onDrillDown={c.c1 && ((s, e) => onDrillDown({ c1: s.value }, e))} />

      <InitialMessage data={data} x={xRule.middle("content")} y={yRule.middle("content")} loading={loading} />
      <g opacity={dashboardFilter ? .5 : undefined}>
        <XAxis xRule={xRule} yRule={yRule} />
        <YAxis xRule={xRule} yRule={yRule} />
      </g>
    </svg>
  );
}
