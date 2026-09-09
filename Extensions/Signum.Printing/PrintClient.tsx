import * as React from 'react'
import { RouteObject } from 'react-router'
import { ajaxPost, ajaxGet } from '@framework/Services';
import { EntitySettings } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import { EntityOperationSettings } from '@framework/Operations'
import * as Operations from '@framework/Operations'
import { PrintLineEntity, PrintPackageEntity, PrintPermission, PrintLineOperation } from './Signum.Printing'
import { ProcessEntity } from '../Signum.Processes/Signum.Processes'
import { FileTypeSymbol } from '../Signum.Files/Signum.Files'
import * as OmniboxSpecialAction from '@framework/OmniboxSpecialAction'
import { ImportComponent } from '@framework/ImportComponent'
// COM-8866: isPermissionAuthorized moved to @framework/AppContext (Upgrade_20230912_isPermissionAuthorized); upstream Signum missed this file at EasyClaim_2024.02.17, fixed locally.
import { isPermissionAuthorized } from '@framework/AppContext'

export function start(options: { routes: RouteObject[], }) {
  Navigator.addSettings(new EntitySettings(PrintLineEntity, e => import('./Templates/PrintLine'), { isCreable: "IsSearch" }));
  Navigator.addSettings(new EntitySettings(PrintPackageEntity, e => import('./Templates/PrintPackage')));

  options.routes.push({ path: "/printing/view", element: <ImportComponent onImport={() => import("./PrintPanelPage")} /> });

  Operations.addSettings(new EntityOperationSettings(PrintLineOperation.SaveTest, { hideOnCanExecute: true }));

  OmniboxSpecialAction.registerSpecialAction({
    allowed: () => isPermissionAuthorized(PrintPermission.ViewPrintPanel),
    key: "PrintPanel",
    onClick: () => Promise.resolve("/printing/view")
  });
}

export module API {
  export function getStats(): Promise<PrintStat[]> {
    return ajaxGet({ url: `/api/printing/stats` });
  }

  export function createPrintProcess(fileType: FileTypeSymbol): Promise<ProcessEntity> {
    return ajaxPost({ url: `/api/printing/createProcess` }, fileType);
  }
}

export interface PrintStat {
  fileType: FileTypeSymbol;
  count: number;
}
