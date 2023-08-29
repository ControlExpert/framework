import * as React from 'react'
import { ValueLine, EntityLine, EntityCombo, EntityDetail, EntityTable } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import ValueLineModal from '@framework/ValueLineModal'
import { useAPI, useForceUpdate } from '@framework/Hooks'
import * as Finder from '@framework/Finder'
import * as Navigator from '@framework/Navigator'
import { getTypeInfos } from '@framework/Reflection'
import { WordTemplateEntity } from '../Signum.Word'
import { TemplateApplicableEval } from '../../Signum.Templating/Signum.Templating'
import { FileLine } from '../../Signum.Files/Components/FileLine'
import TemplateControls from '../../Signum.Templating/TemplateControls'
import TemplateApplicable from '../../Signum.Templating/Templates/TemplateApplicable'
import FilterBuilderEmbedded from '../../Signum.UserAssets/Templates/FilterBuilderEmbedded'
import { Tabs, Tab } from 'react-bootstrap';
import { QueryDescription, SubTokensOptions } from '@framework/FindOptions'
import QueryTokenEmbeddedBuilder from '../../Signum.UserAssets/Templates/QueryTokenEmbeddedBuilder'
import { QueryOrderEmbedded } from '../../Signum.UserAssets/Signum.UserAssets.Queries'
import { UserChartEntity } from '../../Signum.Chart/UserChart/Signum.Chart.UserChart'
import { UserQueryEntity } from '../../Signum.UserQueries/Signum.UserQueries'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function WordTemplate(p: { ctx: TypeContext<WordTemplateEntity> }) {

  const forceUpdate = useForceUpdate();

  const ctx = p.ctx;
  const ctx4 = p.ctx.subCtx({ labelColumns: 4 });
  const canAggregate = ctx.value.groupResults ? SubTokensOptions.CanAggregate : 0;

  const qd = useAPI(() => p.ctx.value.query && Finder.getQueryDescription(p.ctx.value.query.key), [p.ctx.value.query?.key]);

  return (
    <div>

      <div className="row">
        <div className="col-sm-6">
          <ValueLine ctx={ctx4.subCtx(f => f.name)} />
          <EntityLine ctx={ctx4.subCtx(f => f.query)} onChange={forceUpdate} />
          <EntityCombo ctx={ctx4.subCtx(f => f.model)} />

        </div>
        <div className="col-sm-6">
          <EntityCombo ctx={ctx4.subCtx(f => f.wordTransformer)} />
          <EntityCombo ctx={ctx4.subCtx(f => f.wordConverter)} />
          <EntityCombo ctx={ctx4.subCtx(f => f.culture)} />
        </div>
      </div>

      {ctx.value.query &&
        <Tabs id={ctx.prefix + "tabs"} mountOnEnter={true}>
          <Tab eventKey="template" title={ctx.niceName(a => a.template)}>
            <ValueLine ctx={ctx.subCtx(f => f.fileName)} />
            <div className="card form-xs" style={{ marginTop: "10px", marginBottom: "10px" }}>
            <div className="card-header" style={{ padding: "5px" }}>
                <TemplateControls queryKey={ctx.value.query.key} forHtml={false} widgetButtons={<div className="btn-group" style={{ marginLeft: "auto" }}>
                  {UserChartEntity.tryTypeInfo() && qd && <UserChartTemplateButton qd={qd} />}
                  {UserQueryEntity.tryTypeInfo() && qd && <UserQueryTemplateButton qd={qd} />}
                </div>} />
              </div>
            </div>
            <FileLine ctx={ctx.subCtx(e => e.template)} />
          </Tab>
          <Tab eventKey="query" title={<span style={{ fontWeight: ctx.value.groupResults || ctx.value.filters.length > 0 || ctx.value.orders.length ? "bold" : undefined }}>
            {ctx.niceName(a => a.query)}
          </span>}>
            <div className="row">
              <div className="col-sm-4">
                <ValueLine ctx={ctx.subCtx(e => e.disableAuthorization)} inlineCheckbox />
              </div>
              <div className="col-sm-4">
                <ValueLine ctx={ctx.subCtx(e => e.groupResults)} inlineCheckbox onChange={forceUpdate} />
              </div>
              <div className="col-sm-4">
              </div>
            </div>
            <FilterBuilderEmbedded ctx={ctx.subCtx(e => e.filters)} onChanged={forceUpdate}
              subTokenOptions={SubTokensOptions.CanAnyAll | SubTokensOptions.CanElement | canAggregate}
              queryKey={ctx.value.query!.key}/>
            <EntityTable ctx={ctx.subCtx(e => e.orders)} onChange={forceUpdate} columns={EntityTable.typedColumns<QueryOrderEmbedded>([
              {
                property: a => a.token,
                template: ctx => <QueryTokenEmbeddedBuilder
                  ctx={ctx.subCtx(a => a.token, { formGroupStyle: "SrOnly" })}
                  queryKey={p.ctx.value.query!.key}
                  subTokenOptions={SubTokensOptions.CanElement | canAggregate} />
              },
              { property: a => a.orderType }
            ])} />
          </Tab>
          <Tab eventKey="applicable" title={
            <span style={{ fontWeight: ctx.value.applicable ? "bold" : undefined }}>
              {ctx.niceName(a => a.applicable)}
            </span>}>
            <EntityDetail ctx={ctx.subCtx(e => e.applicable)} onChange={forceUpdate}
              getComponent={(ctx2: TypeContext<TemplateApplicableEval>) => <TemplateApplicable ctx={ctx2} query={ctx.value.query!} />} />
          </Tab>
        </Tabs>
      }
    </div>
  );
}

export function UserChartTemplateButton(p: {qd: QueryDescription}) {
  return renderWidgetButton(<><FontAwesomeIcon icon={"chart-bar"} color={"darkviolet"} className="icon" /> {UserChartEntity.niceName()}</>, () => Finder.find<UserChartEntity>({
    queryName: UserChartEntity,
    filterOptions: [
      {
        groupOperation: "Or",
        filters: [
          {
            token: UserChartEntity.token(a => a.entity!.entityType!.entity!.cleanName),
            operation: "IsIn",
            value: [...getTypeInfos(p.qd.columns["Entity"].type!).map(a => a.name)]
          },
          {
            token: UserChartEntity.token(a => a.entity!.entityType!.entity!.cleanName),
            operation: "EqualTo",
            value: null
          }
        ]
      }
    ]
  }).then(uc => uc && Navigator.API.fetch(uc).then(uce => {
    var text = "UserChart:" + uce.guid;

    if ((uce.chartScript.key.contains("Multi") || uce.chartScript.key.contains("Stacked")) && uce.columns[1].element.token != null /*Split*/)
      text += "\nPivot(0, 1, 2)";

    return text;
  })));
}

export function UserQueryTemplateButton(p: { qd: QueryDescription }) {
  return renderWidgetButton(<><FontAwesomeIcon icon={["far", "rectangle-list"]} color={"dodgerblue"} className="icon" /> {UserQueryEntity.niceName()}</>, () => Finder.find<UserChartEntity>({
    queryName: UserQueryEntity,
    filterOptions: [{
      token: UserQueryEntity.token(a => a.entity!.entityType!.entity!.cleanName),
      operation: "IsIn",
      value: [null, ...getTypeInfos(p.qd.columns["Entity"].type!).map(a => a.name)]
    }]
  }).then(uc => uc && Navigator.API.fetch(uc).then(uce => "UserQuery:" + uce.guid)))
}

function renderWidgetButton(text: React.ReactElement, getCode: () => Promise<string | undefined>) {
  return <button className="btn btn-light btn-sm sf-button"

    onClick={() =>
      getCode()
        .then(code =>
          code &&
          ValueLineModal.show({
            type: { name: "string" },
            valueLineType: "TextArea",
            initialValue: code,
            title: "Embedded Widget",
            message: "Make a similar-looking Chart or Table in Excel and copy it to Word or PowerPoint. Then add the following code in the Alternative Text to bind the data:",
            initiallyFocused: true,
          }))} >{text}</button>
}