import { Location } from 'history'
import * as React from 'react'
import * as Navigator from '@framework/Navigator'
import * as AppContext from '@framework/AppContext'
import * as Finder from '@framework/Finder'
import { FindOptions, SearchValue } from '@framework/Search'
import { Lite, liteKey } from '@framework/Signum.Entities'
import { ToolbarConfig, ToolbarResponse } from '../Toolbar/ToolbarClient'
import * as UserQueryClient from './UserQueryClient'
import { UserQueryEntity } from './Signum.Entities.UserQueries'
import { coalesceIcon } from '@framework/Operations/ContextualOperations';
import { useAPI } from '@framework/Hooks';
import { CountIcon } from '../Toolbar/QueryToolbarConfig';
import { useFetchInState } from '@framework/Navigator'
import { parseIcon } from '../Basics/Templates/IconTypeahead'

export default class UserQueryToolbarConfig extends ToolbarConfig<UserQueryEntity> {
  constructor() {
    var type = UserQueryEntity;
    super(type);
  }

  getIcon(element: ToolbarResponse<UserQueryEntity>) {

    if (element.iconName == "count")
      return <CountUserQueryIcon userQuery={element.content!} color={element.iconColor} autoRefreshPeriod={element.autoRefreshPeriod} />;

    return ToolbarConfig.coloredIcon(coalesceIcon(parseIcon(element.iconName), ["far", "list-alt"]), element.iconColor ?? "dodgerblue");
  }

  handleNavigateClick(e: React.MouseEvent<any>, res: ToolbarResponse<UserQueryEntity>) {
    if (!res.openInPopup)
      super.handleNavigateClick(e, res);
    else {
      Navigator.API.fetch(res.content!)
        .then(uq => UserQueryClient.Converter.toFindOptions(uq, undefined))
        .then(fo => Finder.explore(fo, { searchControlProps: { extraOptions: { userQuery: res.content } } }))
        .done();
    }
  }

  navigateTo(res: ToolbarResponse<UserQueryEntity>): Promise<string> {
    return Navigator.API.fetch(res.content!)
      .then(uq => {
        if (uq.refreshMode == "Manual")
          return Promise.resolve(UserQueryClient.userQueryUrl(res.content!));

        return UserQueryClient.Converter.toFindOptions(uq, undefined)
          .then(fo => Finder.findOptionsPath(fo, { userQuery: liteKey(res.content!) }));
      });
  }

  isCompatibleWithUrlPrio(res: ToolbarResponse<UserQueryEntity>, location: Location, query: any): number {
    return query["userQuery"] == liteKey(res.content!) ||
      location.pathname == AppContext.toAbsoluteUrl(UserQueryClient.userQueryUrl(res.content!)) ? 2 : 0;
  }
}


interface CountUserQueryIconProps {
  userQuery: Lite<UserQueryEntity>;
  color?: string;
  autoRefreshPeriod?: number;
}


export function CountUserQueryIcon(p: CountUserQueryIconProps) {

  var userQuery = useFetchInState(p.userQuery)
  var findOptions = useAPI(signal => userQuery ? UserQueryClient.Converter.toFindOptions(userQuery, undefined) : Promise.resolve(undefined), [userQuery]);

  if (findOptions == null)
    return <span className="icon" style={{ color: p.color }}>…</span>;

  return <CountIcon findOptions={findOptions} autoRefreshPeriod={p.autoRefreshPeriod} color={p.color} />
}
