import * as React from 'react'
import { RouteObject } from 'react-router'
import * as Navigator from '@framework/Navigator'
import * as Constructor from '@framework/Constructor'
import * as Finder from '@framework/Finder'
import { EntitySettings } from '@framework/Navigator'
import { EntityLine } from '@framework/Lines'
import { EmailMessagePackageMixin, EmailPackageEntity, SendEmailTaskEntity } from './Signum.Mailing.Package'
import { EmailMessageEntity } from '../Signum.Mailing'

export function start(options: { routes: RouteObject[] }) {
  Navigator.addSettings(new EntitySettings(EmailPackageEntity, e => import('./EmailPackage')));
  Navigator.getSettings(EmailMessageEntity)!.overrideView((rep) => {
    rep.insertAfterLine(e => e.template, ctx => [
      <EntityLine ctx={ctx.subCtx(EmailMessagePackageMixin).subCtx(e => e.package)} hideIfNull />
    ]);
  });
}
