import * as React from 'react'
import { Lite, liteKey } from '@framework/Signum.Entities'
import { OmniboxClient, OmniboxResult, OmniboxMatch } from '../Signum.Omnibox/OmniboxClient'
import { OmniboxProvider } from '../Signum.Omnibox/OmniboxProvider'
import { Navigator } from '@framework/Navigator'
import { Finder } from '@framework/Finder'
import { UserQueryClient } from './UserQueryClient'
import { UserQueryEntity } from './Signum.UserQueries'

export default class UserQueryOmniboxProvider extends OmniboxProvider<UserQueryOmniboxResult>
{
  getProviderName() {
    return "UserQueryOmniboxResult";
  }

  icon(): React.ReactElement {
    return this.coloredIcon( "list-alt", "dodgerblue");
  }

  renderItem(result: UserQueryOmniboxResult): React.ReactNode[] {

    const array: React.ReactNode[] = [];

    array.push(this.icon());

    this.renderMatch(result.toStrMatch, array);

    return array;
  }

  navigateTo(result: UserQueryOmniboxResult): Promise<string> | undefined {

    if (result.userQuery == undefined)
      return undefined;

    return Navigator.API.fetch(result.userQuery)
      .then(uq => UserQueryClient.Converter.toFindOptions(uq, undefined)
        .then(fo => Finder.findOptionsPath(fo, { userQuery: liteKey(result.userQuery) })));
  }

  toString(result: UserQueryOmniboxResult): string {
    return "\"{0}\"".formatWith(result.toStrMatch.text);
  }
}

interface UserQueryOmniboxResult extends OmniboxResult {
  toStr: string;
  toStrMatch: OmniboxMatch;

  userQuery: Lite<UserQueryEntity>;
}
