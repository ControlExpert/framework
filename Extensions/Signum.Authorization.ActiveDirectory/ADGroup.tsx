import * as React from 'react'
import { AutoLine } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import { SearchValueLine } from '@framework/Search';
import { ADGroupEntity } from './Signum.Authorization.ActiveDirectory';
import { AzureADQuery } from './Signum.Authorization.ActiveDirectory.Azure';

export default function ADGroup(p: { ctx: TypeContext<ADGroupEntity> }) {
  const ctx = p.ctx;
  return (
    <div>
      <AutoLine ctx={ctx.subCtx(n => n.displayName)} />
      <SearchValueLine ctx={ctx} findOptions={{
        queryName: AzureADQuery.ActiveDirectoryUsers,
        filterOptions: [{ token: "InGroup", value: ctx.value }]
      }} />
    </div>
  );
}
