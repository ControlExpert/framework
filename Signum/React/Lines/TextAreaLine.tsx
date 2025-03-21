import * as React from 'react'
import { DateTime, Duration } from 'luxon'
import { DatePicker, DropdownList, Combobox } from 'react-widgets'
import { CalendarProps } from 'react-widgets/cjs/Calendar'
import { Dic, addClass, classes } from '../Globals'
import { MemberInfo, TypeReference, toLuxonFormat, toNumberFormat, isTypeEnum, timeToString, tryGetTypeInfo, toFormatWithFixes, splitLuxonFormat, dateTimePlaceholder, timePlaceholder, toLuxonDurationFormat } from '../Reflection'
import { LineBaseController, LineBaseProps, setRefProp, tasks, useController, useInitiallyFocused } from '../Lines/LineBase'
import { FormGroup } from '../Lines/FormGroup'
import { FormControlReadonly } from '../Lines/FormControlReadonly'
import { BooleanEnum, EntityControlMessage, JavascriptMessage } from '../Signum.Entities'
import TextArea from '../Components/TextArea';
import { getTimeMachineIcon } from './TimeMachineIcon'
import { TextBoxLineController } from './TextBoxLine'
import { ValueBaseController, ValueBaseProps } from './ValueBase'
import { TypeContext } from '../Lines'
import { useForceUpdate } from '../Hooks'

export interface TextAreaLineProps extends ValueBaseProps<TextAreaLineController> {
  ctx: TypeContext<string | undefined | null>;
  autoFixString?: boolean;
  autoTrimString?: boolean;
  charCounter?: true | ((length: number) => React.ReactElement | string);
}

export class TextAreaLineController extends ValueBaseController<TextAreaLineProps>{
  init(p: TextAreaLineProps) {
    super.init(p);
    this.assertType("TextAreaLine", ["string"]);
  }
}

export const TextAreaLine = React.memo(React.forwardRef(function TextAreaLine(props: TextAreaLineProps, ref: React.Ref<TextAreaLineController>) {

  const c = useController(TextAreaLineController, props, ref);
  const ccRef = React.useRef<ChartCounterHandler>(null);
  if (c.isHidden)
    return null;

  const s = c.props;

  var htmlAtts = c.props.valueHtmlAttributes;
  var autoResize = htmlAtts?.style?.height == null && htmlAtts?.rows == null;

  if (s.ctx.readOnly)
    return (
      <FormGroup ctx={s.ctx} label={s.label} labelIcon={s.labelIcon} helpText={s.helpText} htmlAttributes={{ ...c.baseHtmlAttributes(), ...s.formGroupHtmlAttributes }} labelHtmlAttributes={s.labelHtmlAttributes}>
        {inputId => <>
          {getTimeMachineIcon({ ctx: s.ctx })}
          <TextArea id={inputId} {...htmlAtts} autoResize={autoResize} className={addClass(htmlAtts, classes(s.ctx.formControlClass, c.mandatoryClass))} value={s.ctx.value || ""}
            disabled />
        </>}
      </FormGroup>
    );

  const handleTextOnChange = (e: React.SyntheticEvent<any>) => {
    const input = e.currentTarget as HTMLInputElement;
    c.setValue(input.value, e);
    ccRef.current?.setCurrentLength(input.value.length);
  };

  let handleBlur: ((e: React.FocusEvent<any>) => void) | undefined = undefined;
  if (s.autoFixString != false) {
    handleBlur = (e: React.FocusEvent<any>) => {
      const input = e.currentTarget as HTMLInputElement;
      var fixed = TextAreaLineController.autoFixString(input.value, s.autoTrimString != null ? s.autoTrimString : false, false);
      if (fixed != input.value)
        c.setValue(fixed, e);

      if (htmlAtts?.onBlur)
        htmlAtts.onBlur(e);
    };
  }

  const handleOnFocus = (e: React.FocusEvent<any>) => {
    console.log("onFocus handler called");
    if (htmlAtts?.onFocus) {
      console.log("passed onFocus called");

      htmlAtts?.onFocus(e);
    }
  }

  var cc = c.props.charCounter == null ? null :
    c.props.charCounter == true && c.props.valueHtmlAttributes?.maxLength ? <ChartCounter myRef={ccRef}>{v => {
      var rem = c.props.valueHtmlAttributes!.maxLength! - v;
      return EntityControlMessage._0CharactersRemaining.niceToString().forGenderAndNumber(rem).formatHtml(<strong className={rem <= 0 ? "text-danger" : undefined}>{rem}</strong>)
    }}</ChartCounter> :

      c.props.charCounter == true ? <ChartCounter myRef={ccRef}>{v => EntityControlMessage._0Characters.niceToString().forGenderAndNumber(s).formatHtml(<strong>{v}</strong>)}</ChartCounter > :
        <ChartCounter myRef={ccRef}>{c.props.charCounter}</ChartCounter>;

  return (
    <FormGroup ctx={s.ctx} label={s.label} labelIcon={s.labelIcon}
      helpText={s.helpText && cc ? <>{cc}<br />{s.helpText}</> : (cc ?? s.helpText)}
      htmlAttributes={{ ...c.baseHtmlAttributes(), ...s.formGroupHtmlAttributes }} labelHtmlAttributes={s.labelHtmlAttributes}>
      {inputId => c.withItemGroup(
        <TextArea {...c.props.valueHtmlAttributes} autoResize={autoResize} className={addClass(c.props.valueHtmlAttributes, classes(s.ctx.formControlClass, c.mandatoryClass))} value={s.ctx.value || ""}
          id={inputId}
          minHeight={c.props.valueHtmlAttributes?.style?.minHeight?.toString()}
          onChange={handleTextOnChange}
          onBlur={handleBlur ?? htmlAtts?.onBlur}
          onFocus={handleOnFocus}
          placeholder={c.getPlaceholder()}
          innerRef={c.setRefs} />
      )}
    </FormGroup>
  );
}), (prev, next) => {
  if (next.extraButtons || prev.extraButtons)
    return false;

  return LineBaseController.propEquals(prev, next);
});

interface ChartCounterHandler {
  setCurrentLength: (length: number) => void;
}

function ChartCounter(p: { children: (length: number) => React.ReactElement | string, myRef: React.Ref<ChartCounterHandler> }) {

  var forceUpdate = useForceUpdate();
  var valueRef = React.useRef(0);

  React.useImperativeHandle(p.myRef, () => {

    var handle: number | undefined = undefined;
    var queued = false;

    return ({
      setCurrentLength: (val) => {
        valueRef.current = val;
        if (!handle) {
          forceUpdate();
          handle = window.setTimeout(() => {
            handle = undefined;
            if (queued) {
              queued = false;
              forceUpdate();
            }
          }, 200);
        } else {
          queued = true;
        }
      }
    });
  }, []);

  return p.children(valueRef.current);
}

export let maxValueLineSize = 100;

tasks.push(taskSetHtmlProperties);
export function taskSetHtmlProperties(lineBase: LineBaseController<any>, state: LineBaseProps) {
  const vl = lineBase instanceof TextBoxLineController || lineBase instanceof TextAreaLineController ? lineBase : undefined;
  const pr = state.ctx.propertyRoute;
  const s = state as TextAreaLineProps;
  if (vl && pr?.propertyRouteType == "Field") {

    var member = pr.member!;

    if (member.maxLength != undefined && !s.ctx.readOnly) {

      if (!s.valueHtmlAttributes)
        s.valueHtmlAttributes = {};

      if (s.valueHtmlAttributes.maxLength == undefined)
        s.valueHtmlAttributes.maxLength = member.maxLength;

      if (s.valueHtmlAttributes.size == undefined)
        s.valueHtmlAttributes.size = maxValueLineSize == undefined ? member.maxLength : Math.min(maxValueLineSize, member.maxLength);

      // if(lineBase instanceof TextAreaLineController)
      //   s.charCounter = true;
    }
  }
}
