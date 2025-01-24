
import * as React from 'react'
import * as AppContext from '@framework/AppContext'
import { LinkListPartEntity, LinkElementEmbedded } from '../Signum.Entities.Dashboard'
import { PanelPartContentProps } from '../DashboardClient';
import { urlVariables } from '../UrlVariables';
import { Dic } from '@framework/Globals';

export default function LinkListPart(p: PanelPartContentProps<LinkListPartEntity >){
  return (
    <ul className="sf-cp-link-list">
      {
        p.content.links.map(mle => mle.element)
          .map((le, i) => {

            var link = le.link;
            Dic.getKeys(urlVariables).forEach(v => {
              link = link.replaceAll(v, urlVariables[v]());
            });

            return (
              <li key={i} >
                <a href={AppContext.toAbsoluteUrl(link)}
                  target={le.opensInNewTab ? "_blank" : undefined}
                  onClick={le.link!.startsWith("~") ? (e => { e.preventDefault(); AppContext.navigate(link) }) : undefined}
                  title={le.label!}>
                  {le.label}
                </a>
              </li>
            );
          })
      }
    </ul>
  );
}
