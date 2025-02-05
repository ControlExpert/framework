import * as React from 'react'
import { OmniboxResult, OmniboxMatch } from '../Signum.Omnibox/OmniboxClient'
import { OmniboxProvider } from '../Signum.Omnibox/OmniboxProvider'


export default class TreeOmniboxProvider extends OmniboxProvider<TreeOmniboxResult>
{
  getProviderName() {
    return "TreeOmniboxResult";
  }

  icon() {
    return this.coloredIcon("sitemap", "gold");
  }

  renderItem(result: TreeOmniboxResult): React.ReactChild[] {

    var array: React.ReactChild[] = [];

    array.push(this.icon());

    this.renderMatch(result.typeMatch, array);

    return array;
  }

  navigateTo(result: TreeOmniboxResult) {
    return Promise.resolve("/tree/" + result.type);
  }

  toString(result: TreeOmniboxResult) {
    return result.typeMatch.text;
  }
}

interface TreeOmniboxResult extends OmniboxResult {
  type: string;
  typeMatch: OmniboxMatch;
}
