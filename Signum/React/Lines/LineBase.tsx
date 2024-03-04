import * as React from 'react'
import { Dic } from '../Globals'
import { TypeContext, StyleOptions } from '../TypeContext'
import { TypeReference } from '../Reflection'
import { ValidationMessage } from '../Signum.Entities.Validation'
import { useForceUpdate } from '../Hooks'

export interface ChangeEvent {
  newValue: any;
  oldValue: any;
  originalEvent?: React.SyntheticEvent; 
}

export interface LineBaseProps<V = unknown> extends StyleOptions {
  ctx: TypeContext<V>;
  unit?: string;
  format?: string;
  type?: TypeReference;
  label?: React.ReactNode;
  labelIcon?: React.ReactNode;
  visible?: boolean;
  hideIfNull?: boolean;
  onChange?: (e: ChangeEvent) => void;
  onValidate?: (val: any) => string;
  extraButtons?: (vl: LineBaseController<any, V>) => React.ReactNode;
  extraButtonsBefore?: (vl: LineBaseController<any, V>) => React.ReactNode;
  labelHtmlAttributes?: React.LabelHTMLAttributes<HTMLLabelElement>;
  formGroupHtmlAttributes?: React.HTMLAttributes<any>;
  helpText?: React.ReactNode | null;
  mandatory?: boolean | "warning";
}

export function useController<C extends LineBaseController<P, V>, P extends LineBaseProps<V>, V>(controllerType: new () => C, props: P, ref: React.Ref<C>): C {
  var controller = React.useMemo<C>(()=> new controllerType(), []);
  controller.init(props);
  React.useImperativeHandle(ref, () => controller, []);
  return controller;
}

export class LineBaseController<P extends LineBaseProps<V>, V> {

  static propEquals<V>(prevProps: LineBaseProps<V>, nextProps: LineBaseProps<V>) {
    if (Dic.equals(prevProps, nextProps, true))
      return true; //For Debugging

    return false;
  }

  props!: P;
  forceUpdate!: () => void;
  changes!: number;
  setChanges!: (changes: React.SetStateAction<number>) => void;

  init(p: P) {
    this.props = this.expandProps(p);
    this.forceUpdate = useForceUpdate();
    [this.changes, this.setChanges] = React.useState(0);
  }

  setValue(val: V, event?: React.SyntheticEvent) {
    var oldValue = this.props.ctx.value;
    this.props.ctx.value = val;
    this.setChanges(c => c + 1);
    this.validate();
    this.forceUpdate();
    if (this.props.onChange)
      this.props.onChange({ oldValue: oldValue, newValue: val, originalEvent: event });
  }

  validate() {
    const error = this.props.onValidate ? this.props.onValidate(this.props.ctx.value) : this.defaultValidate(this.props.ctx.value);
    this.props.ctx.error = error;
    if (this.props.ctx.frame)
      this.props.ctx.frame.revalidate();
  }

  defaultValidate(val: V) {
    if (this.props.type!.isNotNullable && val == undefined)
      return ValidationMessage._0IsNotSet.niceToString(this.props.ctx.niceName());

    return undefined;
  }

  expandProps(props: P): P {

    const { type, ctx,
      readonlyAsPlainText, formSize, formGroupStyle, labelColumns, placeholderLabels, readOnly, valueColumns,
      ...otherProps
    } = props as LineBaseProps;

    const so: StyleOptions = { readonlyAsPlainText, formSize, formGroupStyle, labelColumns, placeholderLabels, readOnly, valueColumns };

    const p = { ctx: ctx.subCtx(so), type: (type ?? ctx.propertyRoute?.typeReference()) } as LineBaseProps as P;

    this.getDefaultProps(p);
    this.overrideProps(p, otherProps as P);
    runTasks(this as any, p as any, props as any);

    return p;
  }

  overrideProps(p: P, overridenProps: P) {
    const labelHtmlAttributes = { ...p.labelHtmlAttributes, ...Dic.simplify(overridenProps.labelHtmlAttributes) };
    Dic.assign(p, Dic.simplify(overridenProps))
    p.labelHtmlAttributes = labelHtmlAttributes;
  }

  getDefaultProps(p: P) {
  }


  baseHtmlAttributes(): React.HTMLAttributes<any> {
    return {
      'data-property-path': this.props.ctx.propertyPath,
      'data-changes': this.changes
    } as any;
  }


  get mandatoryClass() {

    if (this.props.mandatory && !this.props.readOnly) {
      const val = this.props.ctx.value;
      if (val == null || val === "" || Array.isArray(val) && val.length == 0) {
        if (this.props.mandatory == "warning")
          return "sf-mandatory-warning";
        else
          return "sf-mandatory";
      }
    }

    return null;
  }

  get isHidden() {
    return this.props.type == null || this.props.visible == false || this.props.hideIfNull && (this.props.ctx.value == undefined || this.props.ctx.value == "");
  }
}

export function setRefProp(propRef: React.Ref<HTMLElement> | undefined, node: HTMLElement | null) {
  if (propRef) {
    if (typeof propRef == "function")
      propRef(node);
    else
      (propRef as React.MutableRefObject<HTMLElement | null>).current = node;
  }
}

export function useInitiallyFocused(initiallyFocused: boolean | number | undefined, inputElement: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (initiallyFocused) {
      window.setTimeout(() => {
        let element = inputElement?.current;
        if (element) {
          if (element instanceof HTMLInputElement)
            element.setSelectionRange(0, element.value.length);
          else if (element instanceof HTMLTextAreaElement)
            element.setSelectionRange(0, element.value.length);
          element.focus();
        }
      }, initiallyFocused == true ? 0 : initiallyFocused as number);
    }

  }, []);
}


export function genericForwardRef<T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactNode | null): (props: P & React.RefAttributes<T>) => React.ReactNode | null {
  return React.forwardRef(render) as any;
}

export function genericForwardRefWithMemo<T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactNode | null, propsAreEqual?: (prevProps: P, nextProps: P) => boolean): (props: P & React.RefAttributes<T>) => React.ReactNode | null {
  return React.memo(React.forwardRef(render), propsAreEqual as any) as any;
}






export const tasks: ((lineBase: LineBaseController<LineBaseProps, unknown>, state: LineBaseProps, originalProps: LineBaseProps) => void)[] = [];

export function runTasks(lineBase: LineBaseController<LineBaseProps, unknown>, state: LineBaseProps, originalProps: LineBaseProps) {
  tasks.forEach(t => t(lineBase, state, originalProps));
}

tasks.push(taskSetNiceName);
export function taskSetNiceName(lineBase: LineBaseController<LineBaseProps, unknown>, state: LineBaseProps) {
  if (state.label === undefined &&
    state.ctx.propertyRoute &&
    state.ctx.propertyRoute.propertyRouteType == "Field") {
    state.label = state.ctx.propertyRoute.member!.niceName;
  }
}

tasks.push(taskSetReadOnlyProperty);
export function taskSetReadOnlyProperty(lineBase: LineBaseController<LineBaseProps, unknown>, state: LineBaseProps) {
  if (state.ctx.styleOptions.readOnly === undefined && !state.ctx.readOnly && 
    state.ctx.propertyRoute &&
    state.ctx.propertyRoute.propertyRouteType == "Field" &&
    state.ctx.propertyRoute.member!.isReadOnly) {
    state.ctx.readOnly = true;
  }
}

tasks.push(taskSetReadOnly);
export function taskSetReadOnly(lineBase: LineBaseController<LineBaseProps, unknown>, state: LineBaseProps) {
  if (state.ctx.styleOptions.readOnly === undefined && !state.ctx.readOnly &&
    state.ctx.binding.getIsReadonly()) {
    state.ctx.readOnly = true;
  }
}

tasks.push(taskSetMandatory);
export function taskSetMandatory(lineBase: LineBaseController<LineBaseProps, unknown>, state: LineBaseProps) {
  if (state.ctx.propertyRoute && state.mandatory == undefined &&
    state.ctx.propertyRoute.propertyRouteType == "Field" &&
    state.ctx.propertyRoute.member!.required) {
    state.mandatory = true;
  }
}
