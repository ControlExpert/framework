import * as React from 'react'
import { classes } from '../Globals'
import * as Navigator from '../Navigator'
import { TypeContext } from '../TypeContext'
import { ModifiableEntity, Lite, Entity, EntityControlMessage } from '../Signum.Entities'
import { EntityBaseController } from './EntityBase'
import { EntityListBaseController, EntityListBaseProps, DragConfig, MoveConfig } from './EntityListBase'
import { RenderEntity } from './RenderEntity'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { tryGetTypeInfos, getTypeInfo } from '../Reflection';
import { useController } from './LineBase'
import { TypeBadge } from './AutoCompleteConfig'
import { getTimeMachineIcon } from './TimeMachineIcon'
import { Row } from 'react-bootstrap'

export interface EntityRepeaterProps extends EntityListBaseProps {
  createAsLink?: boolean | ((er: EntityRepeaterController) => React.ReactElement<any>);
  avoidFieldSet?: boolean;
  createMessage?: string;
  getTitle?: (ctx: TypeContext<any /*T*/>) => React.ReactChild;
  itemExtraButtons?: (er: EntityListBaseController<EntityListBaseProps>, index: number) => React.ReactElement<any>;
  rowClassName?: (er: EntityListBaseController<EntityListBaseProps>, index: number) => string;
}

export class EntityRepeaterController extends EntityListBaseController<EntityRepeaterProps> {

  getDefaultProps(p: EntityRepeaterProps) {
    super.getDefaultProps(p);
    p.viewOnCreate = false;
    p.createAsLink = true;
  }
}


export const EntityRepeater = React.forwardRef(function EntityRepeater(props: EntityRepeaterProps, ref: React.Ref<EntityRepeaterController>) {
  var c = useController(EntityRepeaterController, props, ref);
  var p = c.props;

  if (c.isHidden)
    return null;

  let ctx = p.ctx;

  if (p.avoidFieldSet == true)
    return (
      <div className={classes("sf-repeater-field sf-control-container", ctx.errorClassBorder)}
        {...{ ...c.baseHtmlAttributes(), ...p.formGroupHtmlAttributes, ...ctx.errorAttributes() }}>
        {renderButtons()}
        {renderElements()}
      </div>
    );

  return (
    <fieldset className={classes("sf-repeater-field sf-control-container", ctx.errorClass)}
      {...{ ...c.baseHtmlAttributes(), ...c.props.formGroupHtmlAttributes, ...ctx.errorAttributes() }}>
      <legend>
        <div>
          <span>{p.label}</span>
          {renderButtons()}
        </div>
      </legend>
      {renderElements()}
    </fieldset>
  );


  function renderButtons() {
    const buttons = (
      <span className="float-end">
        {p.extraButtonsBefore && p.extraButtonsBefore(c)}
        {p.createAsLink == false && c.renderCreateButton(false, p.createMessage)}
        {c.renderFindButton(false)}
        {p.extraButtonsAfter && p.extraButtonsAfter(c)}
      </span>
    );

    return EntityBaseController.hasChildrens(buttons) ? buttons : undefined;
  }

  function renderElements() {
    const readOnly = ctx.readOnly;
    const showType = tryGetTypeInfos(ctx.propertyRoute!.typeReference().name).length > 1;
    return (
      <div className="sf-repater-elements">
        {
          c.getMListItemContext(ctx).map((mlec, i) =>
          (<EntityRepeaterElement key={c.keyGenerator.getKey(mlec.value)}
            onRemove={c.canRemove(mlec.value) && !readOnly ? e => c.handleRemoveElementClick(e, mlec.index!) : undefined}
            ctx={mlec}
            move={c.canMove(mlec.value) && p.moveMode == "MoveIcons" && !readOnly ? c.getMoveConfig(false, mlec.index!, "v") : undefined}
            drag={c.canMove(mlec.value) && p.moveMode == "DragIcon" && !readOnly ? c.getDragConfig(mlec.index!, "v") : undefined}
            itemExtraButtons={p.itemExtraButtons ? (() => p.itemExtraButtons!(c, mlec.index!)) : undefined}
            rowClassName={p.rowClassName ? (() => p.rowClassName!(c, mlec.index!)) : undefined}
            getComponent={p.getComponent}
            getViewPromise={p.getViewPromise}
            title={showType ? <TypeBadge entity={mlec.value} /> : undefined} />))
        }
        {
          p.createAsLink && p.create && !readOnly &&
          (typeof p.createAsLink == "function" ? p.createAsLink(c) :
            <a href="#" title={ctx.titleLabels ? EntityControlMessage.Create.niceToString() : undefined}
              className="sf-line-button sf-create"
              onClick={c.handleCreateClick}>
              {EntityBaseController.getCreateIcon()}&nbsp;{p.createMessage ?? EntityControlMessage.Create.niceToString()}
            </a>)
        }
      </div>
    );
  }
});


export interface EntityRepeaterElementProps {
  ctx: TypeContext<Lite<Entity> | ModifiableEntity>;
  getComponent?: (ctx: TypeContext<ModifiableEntity>) => React.ReactElement<any>;
  getViewPromise?: (entity: ModifiableEntity) => undefined | string | Navigator.ViewPromise<ModifiableEntity>;
  onRemove?: (event: React.MouseEvent<any>) => void;
  move?: MoveConfig;
  drag?: DragConfig;
  title?: React.ReactElement<any>;
  itemExtraButtons?: () => React.ReactElement<any>;
  rowClassName?: () => string;
}

export function EntityRepeaterElement({ ctx, getComponent, getViewPromise, onRemove, move, drag, itemExtraButtons, rowClassName, title }: EntityRepeaterElementProps)
{

  return (
    <div className={classes(drag?.dropClass, rowClassName?.())}
      onDragEnter={drag?.onDragOver}
      onDragOver={drag?.onDragOver}
      onDrop={drag?.onDrop}>
      {getTimeMachineIcon({ ctx: ctx, isContainer: true, translateY:"250%" })}
      <fieldset className="sf-repeater-element"
        {...EntityListBaseController.entityHtmlAttributes(ctx.value)}>
        {(onRemove || move || drag || itemExtraButtons || title) &&
          <legend>
            <div className="item-group">
              {onRemove && <a href="#" className={classes("sf-line-button", "sf-remove")}
                onClick={onRemove}
                title={ctx.titleLabels ? EntityControlMessage.Remove.niceToString() : undefined}>
                {EntityListBaseController.getRemoveIcon()}
              </a>}
              &nbsp;
              {move?.renderMoveUp()}
              {move?.renderMoveDown()}
              {drag && <a href="#" className={classes("sf-line-button", "sf-move")} onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                draggable={true}
                onDragStart={drag.onDragStart}
                onDragEnd={drag.onDragEnd}
                onKeyDown={drag.onKeyDown}
                title={drag.title}>
                {EntityListBaseController.getMoveIcon()}
              </a>}
              {itemExtraButtons && itemExtraButtons()}
              {title && '\xa0'}
              {title}
            </div>
          </legend>}
        <div className="sf-line-entity">
          <RenderEntity ctx={ctx} getComponent={getComponent} getViewPromise={getViewPromise} />
        </div>
      </fieldset>
    </div>
  );
}

