import * as React from 'react'
import { DateTime, Duration } from 'luxon'
import { CalendarProps } from 'react-widgets/cjs/Calendar'
import { DatePicker, DropdownList, Combobox } from 'react-widgets'
import { addClass, classes } from '../Globals'
import { MemberInfo, TypeReference, toLuxonFormat, toNumberFormat, isTypeEnum, tryGetTypeInfo, toFormatWithFixes, splitLuxonFormat, dateTimePlaceholder, timePlaceholder } from '../Reflection'
import { LineBaseController, LineBaseProps, tasks, useController } from '../Lines/LineBase'
import { FormGroup } from '../Lines/FormGroup'
import { FormControlReadonly } from '../Lines/FormControlReadonly'
import { BooleanEnum, JavascriptMessage } from '../Signum.Entities'
import TextArea from '../Components/TextArea';
import { ValueBaseController, ValueBaseProps } from './ValueBase'
import { defaultRenderDay, trimDateToFormat } from './DateTimeLine'
import { TimeTextBox, isDurationKey } from './TimeLine'
import { TypeContext } from '../TypeContext'

export interface DateTimeSplittedLineProps extends ValueBaseProps<DateTimeSplittedLineController> {
  ctx: TypeContext<string /*Date or DateTime*/ | undefined | null>;
  minDate?: Date;
  maxDate?: Date;
  calendarProps?: Partial<CalendarProps>;
  initiallyShowOnly?: "Date" | "Time";
}

export class DateTimeSplittedLineController extends ValueBaseController<DateTimeSplittedLineProps>{
  init(p: DateTimeSplittedLineProps) {
    super.init(p);
    this.assertType("DateTimeSplittedLine", ["DateOnly", "DateTime"]);
  }
}


export const DateTimeSplittedLine = React.memo(React.forwardRef(function DateTimeSplittedLine(props: DateTimeSplittedLineProps, ref: React.Ref<DateTimeSplittedLineController>) {

  const c = useController(DateTimeSplittedLineController, props, ref);

  if (c.isHidden)
    return null;

  const s = c.props;
  const type = c.props.type!.name as "DateOnly" | "DateTime";
  const luxonFormat = toLuxonFormat(s.format, type);

  const dt = s.ctx.value ? DateTime.fromISO(s.ctx.value) : undefined;

  if (s.ctx.readOnly)
    return (
      <FormGroup ctx={s.ctx} label={s.label} labelIcon={s.labelIcon} helpText={s.helpText} htmlAttributes={{ ...c.baseHtmlAttributes(), ...s.formGroupHtmlAttributes }} labelHtmlAttributes={s.labelHtmlAttributes}>
        {inputId => c.withItemGroup(<FormControlReadonly id={inputId} htmlAttributes={c.props.valueHtmlAttributes} className={addClass(c.props.valueHtmlAttributes, "sf-readonly-date")} ctx={s.ctx} innerRef={c.setRefs}>
          {dt && toFormatWithFixes(dt, luxonFormat)}
        </FormControlReadonly>)}
      </FormGroup>
    );

  const handleDatePickerOnChange = (date: Date | null | undefined) => {

    var newDT = date && DateTime.fromJSDate(date);

    if (newDT)
      newDT = trimDateToFormat(newDT, type, s.format);

    // bug fix with farsi locale : luxon cannot parse Jalaali dates so we force using en-GB for parsing and formatting
    c.setValue(newDT == null || !newDT.isValid ? null : newDT.toISO()!);
  };

  return (
    <FormGroup ctx={s.ctx} label={s.label} labelIcon={s.labelIcon} helpText={s.helpText} htmlAttributes={{ ...c.baseHtmlAttributes(), ...s.formGroupHtmlAttributes }} labelHtmlAttributes={s.labelHtmlAttributes}>
      {inputId => c.withItemGroup(
        <DateTimePickerSplitted value={dt?.toJSDate()} onChange={handleDatePickerOnChange}
          id={inputId}
          initiallyFocused={Boolean(c.props.initiallyFocused)}
          initiallyShowOnly={c.props.initiallyShowOnly}
          luxonFormat={luxonFormat}
          minDate={s.minDate}
          maxDate={s.maxDate}
          mandatoryClass={c.mandatoryClass}
          timeTextBoxClass={s.ctx.formControlClass}
          htmlAttributes={s.valueHtmlAttributes}
          widgetClass={s.ctx.rwWidgetClass}
          calendarProps={{
            renderDay: defaultRenderDay,
            ...s.calendarProps
          }}
        />
      )}
    </FormGroup>
  );
}), (prev, next) => {
  if (next.extraButtons || prev.extraButtons)
    return false;

  return LineBaseController.propEquals(prev, next);
});

function DateTimePickerSplitted(p: {
  value: Date | null | undefined;
  onChange: (newDateTime: Date | null | undefined) => void,
  luxonFormat: string,
  htmlAttributes?: React.AllHTMLAttributes<HTMLInputElement>,
  mandatoryClass?: string | null,
  widgetClass?: string
  timeTextBoxClass?: string;
  minDate?: Date,
  maxDate?: Date,
  initiallyFocused?: boolean,
  calendarProps?: Partial<CalendarProps>;
  initiallyShowOnly?: "Date" | "Time";
  id: string;
}) {

  const [dateFormat, timeFormat] = splitLuxonFormat(p.luxonFormat);

  const [temp, setTemp] = React.useState<{ type: "Date", date: string } | { type: "Time", time: string } | null>(() => {
    if (p.initiallyShowOnly == null || p.value == null)
      return null;

    if (p.initiallyShowOnly == "Date")
      return ({ type: "Date", date: DateTime.fromJSDate(p.value).toISODate()! });

    if (p.initiallyShowOnly == "Time")
      return ({ type: "Time", time: getTimeOfDay(DateTime.fromJSDate(p.value)).toISOTime()! });

    return null;
  });

  function handleTimeChange(time: string | null) {
    if (time == null) {
      if (p.value != null && temp == null) {
        setTemp({ type: "Date", date: DateTime.fromJSDate(p.value).startOf("day").toISODate()! });
      } else if (temp?.type == "Time") {
        setTemp(null);
      }
    } else {
      if (p.value != null) {
        p.onChange(DateTime.fromJSDate(p.value).startOf("day").plus(Duration.fromISOTime(time)).toJSDate());
        setTemp(null);
      } else if (temp?.type == "Date") {
        p.onChange(DateTime.fromISO(temp.date).plus(Duration.fromISOTime(time)).toJSDate());
        setTemp(null);
      } else {
        setTemp({ type: "Time", time: time });
      }
    }
  }

  function handleDateChange(date: Date | null | undefined) {
    if (date == null) {
      if (p.value != null && temp == null) {
        p.onChange(null);
        setTemp({ type: "Time", time: getTimeOfDay(DateTime.fromJSDate(p.value)).toISOTime()! });
      } else if (temp?.type == "Date") {
        p.onChange(null);
        setTemp(null);
      }
    } else {
      if (p.value != null) {
        p.onChange(DateTime.fromJSDate(date).startOf("day").plus(getTimeOfDay(DateTime.fromJSDate(p.value))).toJSDate());
        setTemp(null);
      } else if (temp?.type == "Time") {
        p.onChange(DateTime.fromJSDate(date).startOf("day").plus(Duration.fromISOTime(temp.time)).toJSDate());
        setTemp(null);
      } else {
        setTemp({ type: "Date", date: DateTime.fromJSDate(date).toISODate()! });
      }
    }
  }

  function getTimeOfDay(dt: DateTime): Duration {
    return dt.diff(dt.startOf("day"));
  }

  return (
    <div className="d-flex">
      <div style={{ flex: 2 }} className={classes(p.widgetClass, temp?.type == "Time" ? "sf-mandatory-widget" : p.mandatoryClass ? p.mandatoryClass + "-widget" : null, "pe-1")}>
        <DatePicker
          value={temp == null ? (p.value ? DateTime.fromJSDate(p.value).startOf("day").toJSDate() : null) :
            (temp?.type == "Date" ? DateTime.fromISO(temp.date).toJSDate() : null)}
          onChange={handleDateChange}
          autoFocus={Boolean(p.initiallyFocused)}
          valueEditFormat={dateFormat}
          valueDisplayFormat={dateFormat}
          includeTime={false}
          inputProps={p.htmlAttributes as any}
          placeholder={(p.htmlAttributes?.placeholder ?? dateTimePlaceholder(dateFormat))}
          messages={{ dateButton: JavascriptMessage.Date.niceToString() }}
          min={p.minDate}
          max={p.maxDate}
          calendarProps={{
            renderDay: defaultRenderDay,
            ...p.calendarProps
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        {timeFormat == null ?
          <span className="text-danger">Error: No timeFormat in {p.luxonFormat}</span> :
          <TimeTextBox
            value={temp == null ?
              (p.value ? getTimeOfDay(DateTime.fromJSDate(p.value))?.toISOTime() : null) :
              (temp.type == "Time" ? temp.time : null)}
            onChange={handleTimeChange}
            validateKey={isDurationKey}
            htmlAttributes={{
              ...p.htmlAttributes,
              placeholder: timePlaceholder(timeFormat),
            }}
            formControlClass={classes(p.timeTextBoxClass, temp?.type == "Date" ? "sf-mandatory" : p.mandatoryClass)}
            durationFormat={timeFormat!} />
        }
      </div>
    </div>
  );
}



