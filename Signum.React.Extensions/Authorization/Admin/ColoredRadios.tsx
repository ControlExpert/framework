import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import "./AuthAdmin.css"
import { coalesceIcon } from '@framework/Operations/ContextualOperations';
import { classes } from '../../../Signum.React/Scripts/Globals';

interface ColorRadioProps {
  checked: boolean;
  readOnly: boolean;
  onClicked: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  color: string;
  title?: string;
  icon?: IconProp;
}

export function ColorRadio(p : ColorRadioProps){
  return (
    <a onClick={e => { e.preventDefault(); !p.readOnly && p.onClicked(e); }} title={p.title}
      className={classes("sf-auth-chooser", p.readOnly && "sf-not-allowed")}
      style={{ color: p.checked ? p.color : "#aaa" }}>
      <FontAwesomeIcon icon={coalesceIcon(p.icon, ["far", (p.checked ? "dot-circle" : "circle")])!} />
    </a>
  );
}

export function GrayCheckbox(p : { checked: boolean, onUnchecked: () => void, readOnly: boolean }){
  return (
    <span className={classes("sf-auth-checkbox", p.readOnly && "sf-not-allowed")}
      onClick={p.checked && !p.readOnly ? p.onUnchecked : undefined}>
      <FontAwesomeIcon icon={["far", p.checked ? "check-square" : "square"]} />
    </span>
  );
}




