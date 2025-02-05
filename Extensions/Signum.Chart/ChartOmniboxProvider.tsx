import * as React from 'react'
import { OmniboxMessage } from '../Signum.Omnibox/Signum.Omnibox'
import { OmniboxResult, OmniboxMatch } from '../Signum.Omnibox/OmniboxClient'
import { OmniboxProvider } from '../Signum.Omnibox/OmniboxProvider'
import * as ChartClient from './ChartClient'

export default class ChartOmniboxProvider extends OmniboxProvider<ChartOmniboxResult>
{
  getProviderName() {
    return "ChartOmniboxResult";
  }

  icon() {
    return this.coloredIcon("chart-bar", "violet");
  }

  renderItem(result: ChartOmniboxResult): React.ReactChild[] {

    const array: React.ReactChild[] = [];

    array.push(this.icon());

    this.renderMatch(result.keywordMatch, array);
    array.push("\u0020");

    if (result.queryNameMatch != undefined)
      this.renderMatch(result.queryNameMatch, array);
    else
      array.push(this.coloredSpan(OmniboxMessage.Omnibox_Query.niceToString() + "...", "lightgray"));

    return array;
  }

  navigateTo(result: ChartOmniboxResult) {

    if (result.queryNameMatch == undefined)
      return undefined;
    
    const path = ChartClient.Encoder.chartPath({ queryName: result.queryName, orderOptions: [], filterOptions: [] });

    return Promise.resolve(path);
  }

  toString(result: ChartOmniboxResult) {
    if (result.queryNameMatch == undefined)
      return result.keywordMatch.text;

    return "{0} {1}".formatWith(result.keywordMatch.text, result.queryNameMatch.text);
  }
}

interface ChartOmniboxResult extends OmniboxResult {
  keywordMatch: OmniboxMatch;

  queryName: string;
  queryNameMatch: OmniboxMatch;
}
