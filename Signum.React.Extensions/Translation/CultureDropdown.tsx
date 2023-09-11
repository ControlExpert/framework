import * as React from 'react'
import { Dic } from '@framework/Globals';
import { Lite, is } from '@framework/Signum.Entities'
import { CultureInfoEntity } from '../Basics/Signum.Entities.Basics'
import * as CultureClient from './CultureClient'
import { NavDropdown } from 'react-bootstrap';
import { useAPI } from '@framework/Hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function CultureDropdown(p: { fullName?: boolean }) {

  var cultures = useAPI(signal => CultureClient.getCultures(null), []);

  if (!cultures)
    return null;

  const current = CultureClient.currentCulture;

  function handleSelect(c: Lite<CultureInfoEntity>) {
    CultureClient.changeCurrentCulture(c);
  }

  return (
    <NavDropdown data-culture={current.name} title={p.fullName ? current.nativeName : simplifyName(current.nativeName)} className="sf-culture-dropdown">
      {Dic.map(cultures, (name, c, i) =>
        <NavDropdown.Item key={i} data-culture={name} disabled={is(c, current)} onClick={() => handleSelect(c)}>
          {p.fullName ? c.toStr : simplifyName(c.toStr!)}
        </NavDropdown.Item>
      )}
    </NavDropdown >
  );
}

function simplifyName(name: string) {
  return name.tryBefore("(")?.trim() ?? name;
}

export function CultureDropdownMenuItem(props: { fullName?: boolean }) {
  var [show, setShow] = React.useState(false);

  var cultures = useAPI(signal => CultureClient.getCultures(false), []);

  if (!cultures)
    return null;

  const current = CultureClient.currentCulture;

  function handleSelect(c: Lite<CultureInfoEntity>) {
    CultureClient.changeCurrentCulture(c);
  }

  return (
    <div>
      <div className={"dropdown-item"}
        style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center" }}
        onClick={() => setShow(!show)}>
        <FontAwesomeIcon icon="globe" fixedWidth className="me-2" /> <span style={{ width: "100%" }}>{CultureInfoEntity.niceName()}</span> <FontAwesomeIcon icon={!show ? "caret-down" : "caret-up"} />
      </div>
      <div style={{ display: show ? "block" : "none" }}>
        {Dic.map(cultures, (name, c, i) =>
          <NavDropdown.Item key={i} data-culture={name} disabled={is(c, current)} onClick={() => handleSelect(c)}>
            {props.fullName ? c.toStr : simplifyName(c.toStr!)}
          </NavDropdown.Item>
        )}
      </div>
    </div>
  );
} 
