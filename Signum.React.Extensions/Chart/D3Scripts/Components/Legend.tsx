import * as React from 'react'
import * as d3 from 'd3'
import { translate } from './ChartUtils';
import TextEllipsis from './TextEllipsis';
import { Rule } from './Rule';
import { PivotTable } from './PivotTable';

interface LegendProps {
  pivot: PivotTable;
  xRule: Rule<"content">;
  yRule: Rule<"legend">;
  color: d3.ScaleOrdinal<string, string>;
}

export default function Legend(p: LegendProps) {

  const { pivot, xRule, yRule, color } = p;

  var legendScale = d3.scaleBand()
    .domain(pivot.columns.map((s, i) => i.toString()))
    .range([0, xRule.size('content')]);

  if (legendScale.bandwidth() <= 50)
    return null;

  var legendMargin = yRule.size('legend') + 4;

  var textWidth = legendScale.bandwidth() - legendMargin;

  return (
    <g>
      <g className="color-legend" transform={translate(xRule.start('content'), yRule.start('legend'))}>
        {pivot.columns.map((s, i) =><g> <rect key={s.key} className="color-rect" transform={translate(legendScale(i.toString())!, 0)}
          width={yRule.size('legend')}
          height={yRule.size('legend')}
          fill={s.color ?? color(s.key)} />
          {(textWidth > 30) && <TextEllipsis key={s.key} transform={translate(legendScale(i.toString())! + legendMargin, yRule.size('legend')  / 2 + 1)}
            maxWidth={textWidth} className="color-text"
            dominantBaseline="middle">
            {s.niceName!}
          </TextEllipsis>
          }
          <title>
            {s.niceName}
          </title>
          </g>
          )}
      </g>
    </g>
  );
}
