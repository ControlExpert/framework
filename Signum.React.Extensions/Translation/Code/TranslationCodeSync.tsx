import * as React from 'react'
import { useLocation, useParams } from 'react-router'
import { Dic } from '@framework/Globals'
import { notifySuccess } from '@framework/Operations'
import { getToString, Lite } from '@framework/Signum.Entities'
import * as CultureClient from '../CultureClient'
import { API, AssemblyResult } from '../TranslationClient'
import { CultureInfoEntity } from '../../Basics/Signum.Entities.Basics'
import { TranslationMessage } from '../Signum.Entities.Translation'
import { TranslationTypeTable } from './TranslationTypeTable'
import { Link } from "react-router-dom";
import "../Translation.css"
import { decodeDots, encodeDots } from './TranslationCodeStatus'
import { useAPI, useAPIWithReload } from '@framework/Hooks'
import { useTitle } from '@framework/AppContext'

export default function TranslationCodeSync() {
  const params = useParams() as { culture: string; assembly: string; namespace?: string; };
  const cultures = useAPI(() => CultureClient.getCultures(null), []);
  const assembly = decodeDots(params.assembly);
  const culture = params.culture;
  const namespace = params.namespace && decodeDots(params.namespace);

  const [result, reloadResult] = useAPIWithReload(() => API.sync(assembly, culture, namespace), [assembly, culture, namespace]);  

  var message = result?.totalTypes == 0 ? TranslationMessage._0AlreadySynchronized.niceToString(namespace ?? assembly) :
    TranslationMessage.Synchronize0In1.niceToString(namespace ?? assembly, cultures ? getToString(cultures[culture]) : culture) +
    (result ? ` [${Dic.getKeys(result.types).length}/${result.totalTypes}]` : " …");

  useTitle(message);

  function handleSave() {
    API.save(assembly, culture ?? "", result!)
      .then(() => notifySuccess())
      .then(() => reloadResult());
  }

  return (
    <div>
      <h2><Link to="/translation/status">{TranslationMessage.CodeTranslations.niceToString()}</Link> {">"} {message}</h2>
      <br />
      {result && result.totalTypes > 0 && <SyncTable result={result} onSave={handleSave} currentCulture={culture} />}
      {result && result.totalTypes == 0 && <Link to={`/translation/syncNamespaces/${encodeDots(assembly)}/${culture}`}>
        {TranslationMessage.BackToSyncAssembly0.niceToString(assembly)}
      </Link>}
    </div>
  );
}

function SyncTable({ result, onSave, currentCulture }: { result: AssemblyResult, onSave: () => void, currentCulture: string }) {

  return (
    <div>
      {Dic.getValues(result.types)
        .map(type => <TranslationTypeTable key={type.type} type={type} result={result} currentCulture={currentCulture} />)}
      <button className="btn btn-primary" onClick={onSave}>{TranslationMessage.Save.niceToString()}</button>
    </div>
  );
}
