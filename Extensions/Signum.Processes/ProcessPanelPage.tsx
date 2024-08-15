import * as React from 'react'
import EntityLink from '@framework/SearchControl/EntityLink'
import { ProcessClient } from './ProcessClient'
import { ProcessEntity } from './Signum.Processes'
import { SearchControl } from '@framework/Search';
import { useAPIWithReload, useInterval } from '@framework/Hooks'
import { useTitle } from '@framework/AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { classes } from '@framework/Globals'
import { ProcessProgressBar } from './Templates/Process'
import { FrameMessage } from '../../Signum/React/Signum.Entities';
import { Overlay, Tooltip } from "react-bootstrap";
import * as AppContext from '@framework/AppContext';

export default function ProcessPanelPage(): React.JSX.Element {

  
  const [state, reloadState] = useAPIWithReload(() => ProcessClient.API.view(), [], { avoidReset: true });

  const tick = useInterval(state == null || state.running ? 500 : null, 0, n => n + 1);

  React.useEffect(() => {
    reloadState();
  }, [tick]);

  useTitle("ProcessLogic state");

  function handleStop(e: React.MouseEvent<any>) {
    e.preventDefault();
    ProcessClient.API.stop().then(() => reloadState());
  }

  function handleStart(e: React.MouseEvent<any>) {
    e.preventDefault();
    ProcessClient.API.start().then(() => reloadState());
  }


  if (state == undefined)
    return <h2>ProcesLogic state (loading...) </h2>;

  const s = state;

  return (
    <div>
      <div className='d-flex align-items-center'><h2 className="display-6"><FontAwesomeIcon icon={"gears"} /> Process Panel</h2><CopyHealthCheckButton /></div>
      <div className="btn-toolbar mt-3">
        <button className={classes("sf-button btn", s.running ? "btn-success disabled" : "btn-outline-success")} onClick={!s.running ? handleStart : undefined}><FontAwesomeIcon icon="play" /> Start</button>
        <button className={classes("sf-button btn", !s.running ? "btn-danger disabled" : "btn-outline-danger")} onClick={s.running ? handleStop : undefined}><FontAwesomeIcon icon="stop" /> Stop</button>
      </div >
      <div id="processMainDiv">
        State: <strong>
          {s.running ?
            <span style={{ color: "green" }}> RUNNING </span> :
            <span style={{ color: state.initialDelayMilliseconds == null ? "gray" : "red" }}> STOPPED </span>
          }</strong>
          <a className="ms-2" href={AppContext.toAbsoluteUrl("/api/processes/simpleStatus")} target="_blank">SimpleStatus</a>
        <br />
        JustMyProcesses: {s.justMyProcesses.toString()}
        <br />
        MachineName: {s.machineName}
        <br />
        ApplicatonName: {s.applicationName}
        <br />
        MaxDegreeOfParallelism: {s.maxDegreeOfParallelism}
        <br />
        InitialDelayMilliseconds: {s.initialDelayMilliseconds}
        <br />
        NextPlannedExecution: {s.nextPlannedExecution ?? "-None-"}
        <br />
        <table className="table">
          <thead>
            <tr>
              <th>Process</th>
              <th>State</th>
              <th style={{ minWidth: "30%" }}>Progress</th>
              <th>MachineName</th>
              <th>ApplicationName</th>
              <th>IsCancellationRequested</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6}>
                <b> {s.executing.length} processes executing in {s.machineName} / {s.applicationName}</b>
              </td>
            </tr>
            {s.executing.map((item, i) =>
              <tr key={i}>
                <td> <EntityLink lite={item.process} inSearch="main" /> </td>
                <td> {item.state} </td>
                <td style={{ verticalAlign: "middle" }}>  <ProcessProgressBar state={item.state} progress={item.progress} /></td>
                <td> {item.machineName} </td>
                <td> {item.applicationName} </td>
                <td> {item.isCancellationRequested} </td>
              </tr>
            )}
          </tbody>
        </table>

        <br />
        <h2>Latest Processes</h2>
        <SearchControl findOptions={{
          queryName: ProcessEntity,
          orderOptions: [{ token: ProcessEntity.token(e => e.creationDate), orderType: "Descending" }],
          pagination: { elementsPerPage: 10, mode: "Firsts" }
        }}
          deps={[state?.executing.map(a => a.process.id!.toString()).join(",")]}
        />
      </div>
      <pre>
        {s.log}
      </pre>
    </div>
  );
}

function CopyHealthCheckButton(): React.JSX.Element | null {

  const supportsClipboard = (navigator.clipboard && window.isSecureContext);
  if (!supportsClipboard)
    return null;

  const link = React.useRef<HTMLAnchorElement>(null);
  const [showTooltip, setShowTooltip] = React.useState<boolean>(false);
  const elapsed = useInterval(showTooltip ? 1000 : null, 0, d => d + 1);

  React.useEffect(() => {
    setShowTooltip(false);
  }, [elapsed]);

  return (
    <span >
      <a ref={link} className="btn btn-sm btn-light text-dark sf-pointer mx-1" onClick={handleCopyLiteButton}
        title="Copy Health Check dashboard data">
        <FontAwesomeIcon icon="heart-pulse" color="gray" />
      </a>
      <Overlay target={link.current} show={showTooltip} placement="bottom">
        <Tooltip>
          {FrameMessage.Copied.niceToString()}
        </Tooltip>
      </Overlay>
    </span>
  );

  function handleCopyLiteButton(e: React.MouseEvent<any>) {
    e.preventDefault();
    var url = window.location;
    navigator.clipboard.writeText(url.hostname + ' Process engine$#$' + url.origin + AppContext.toAbsoluteUrl('/api/processes/healthCheck') + "$#$" + url.href)
      .then(() => setShowTooltip(true));
  }
}
