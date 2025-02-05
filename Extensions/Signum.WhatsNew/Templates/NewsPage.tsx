import * as React from 'react'
import { EntityControlMessage, getToString, JavascriptMessage } from '@framework/Signum.Entities';
import { WhatsNewEntity, WhatsNewLogEntity, WhatsNewMessage } from '../Signum.WhatsNew';
import { useAPI } from '@framework/Hooks';
import { API } from "../WhatsNewClient";
import "./NewsPage.css"
import * as AppContext from "@framework/AppContext"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams } from "react-router-dom";
import { HtmlViewer } from './WhatsNewHtmlEditor';
import { Link } from 'react-router-dom';
import * as Navigator from '@framework/Navigator'
import EntityLink from '@framework/SearchControl/EntityLink';

export default function NewsPage() {
  const params = useParams() as { newsId: string };

  const [refreshValue, setRefreshValue] = React.useState<number>(0);
  const whatsnew = useAPI(() => API.newsPage(params.newsId).then(w => {
    Navigator.raiseEntityChanged(WhatsNewLogEntity);
    return w;
  }), [params.newsId, refreshValue]);

  if (whatsnew == undefined)
    return <div>{JavascriptMessage.loading.niceToString()}</div>;

  return (
    <div key={whatsnew.whatsNew.id} style={{ position: "relative", margin: "10px", }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Link to={"/news/"} style={{ textDecoration: "none" }}> <FontAwesomeIcon icon={"angles-left"} /> {WhatsNewMessage.BackToOverview.niceToString()}</Link>
        {!Navigator.isReadOnly(WhatsNewEntity) && <small className="ms-2 lead"><EntityLink lite={whatsnew.whatsNew} onNavigated={() => setRefreshValue(a => a + 1)}><FontAwesomeIcon icon="pen-to-square" title={EntityControlMessage.Edit.niceToString()} /></EntityLink></small>}
      </div>


      <div className={"whatsnewbody"} key={whatsnew.whatsNew.id}>
        {whatsnew.previewPicture != undefined && <img src={AppContext.toAbsoluteUrl("/api/whatsnew/previewPicture/" + whatsnew.whatsNew.id)} className={"headerpicture headerpicture-shadow"} alt={getToString(whatsnew.whatsNew)} />}
        <div className={"news pt-2"}>
          <h3 className={"news-title"}>{whatsnew.title} {!Navigator.isReadOnly(WhatsNewEntity) && <small style={{ color: "#d50a30" }}>{(whatsnew.status == "Draft") ? whatsnew.status : undefined}</small>}</h3>
            <HtmlViewer text={whatsnew.description} />
        </div>
      </div>
    </div>
  );
}
