import * as React from 'react'
import { openModal, IModalProps } from './Modals';
import { SelectorMessage, Lite, getToString, liteKey, Entity, JavascriptMessage } from './Signum.Entities'
import { TypeInfo, EnumType, Type, getTypeInfo } from './Reflection'
import * as Finder from './Finder'
import { BsSize } from './Components';
import { Modal } from 'react-bootstrap';

interface SelectorModalProps extends IModalProps<any> {
  options: { value: any; displayName: React.ReactNode; name: string; htmlAttributes?: React.HTMLAttributes<HTMLButtonElement> }[];
  title: React.ReactNode;
  message: React.ReactNode;
  size?: BsSize;
  dialogClassName?: string;
  multiSelect?: boolean;
}

export default function SelectorModal(p: SelectorModalProps) {

  const [show, setShow] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState < string[] >([]);
  const selectedValue = React.useRef<any>(undefined);

  function handleButtonClicked(val: any) {
    selectedValue.current = val;
    setShow(false);
  }

  function handleOkClicked() {
    selectedValue.current = selectedItems;    
    setShow(false);
  }

  function handleCancelClicked() {
    setShow(false);
  }

  function handleOnExited() {
    p.onExited!(selectedValue.current);
  }

  function handleCheckboxOnChange(e: React.SyntheticEvent<any>) {
    const input = e.currentTarget as HTMLInputElement;
    if (input.checked) {
      setSelectedItems([...selectedItems, input.name]);
    }
    else {
      setSelectedItems(selectedItems.filter(i => i != input.name));
    }
  };

  return (
    <Modal size={p.size || "sm" as any} show={show} onExited={handleOnExited}
      className="sf-selector-modal" dialogClassName={p.dialogClassName} onHide={handleCancelClicked}>
      <div className="modal-header">
        {p.title &&
          <h4 className="modal-title">
            {p.title}
          </h4>
        }
        <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={handleCancelClicked}/>
      </div>

      <div className="modal-body">
        <div>
          {p.message && (typeof p.message == "string" ? <p>{p.message}</p> : p.message)}
          {p.options.map((o, i) =>
            p.multiSelect ? <label style={{ display: "block" }} key={i}>
              <input type="checkbox" onChange={handleCheckboxOnChange} className={"form-check-input"} name={o.name} checked={selectedItems.contains(o.name)} /> 
              {" "}{o.displayName} 
              </label> :
            <button key={i} type="button" onClick={() => handleButtonClicked(o.value)} name={o.name}
              className="sf-chooser-button sf-close-button btn btn-light" {...o.htmlAttributes}>
              {o.displayName}
            </button>)}
        </div>
        {p.multiSelect && <button type="button" onClick={() => handleOkClicked()} 
          className="btn btn-primary mt-2">
          {JavascriptMessage.ok.niceToString()}
        </button>}
      </div>
    </Modal>
  );
}

SelectorModal.chooseElement = <T extends Object>(options: T[], config?: SelectorConfig<T>): Promise<T | undefined> => {
  const { buttonDisplay, buttonName, title, message, size, dialogClassName } = config || {} as SelectorConfig<T>;

  if (!config || !config.forceShow) {
    if (options.length == 1)
      return Promise.resolve(options.single());

    if (options.length == 0)
      return Promise.resolve(undefined);
  }

  return openModal<T>(<SelectorModal
    options={options.map(a => ({
      value: a,
      displayName: buttonDisplay ? buttonDisplay(a) : a.toString(),
      name: buttonName ? buttonName(a) : a.toString(),
      htmlAttributes: config?.buttonHtmlAttributes && config.buttonHtmlAttributes(a)
    }))}
    title={title || SelectorMessage.ChooseAValue.niceToString()}
    message={message ?? SelectorMessage.PleaseChooseAValueToContinue.niceToString()}
    size={size}
    dialogClassName={dialogClassName} />);
};

SelectorModal.chooseManyElement = <T extends Object>(options: T[], config?: SelectorConfig<T>): Promise<T[] | undefined> => {
  const { buttonDisplay, buttonName, title, message, size, dialogClassName } = config || {} as SelectorConfig<T>;

  if (!config || !config.forceShow) {
    if (options.length == 1)
      return Promise.resolve(options);

    if (options.length == 0)
      return Promise.resolve(undefined);
  }

  return openModal<T[]>(<SelectorModal
    options={options.map(a => ({
      value: a,
      displayName: buttonDisplay ? buttonDisplay(a) : a.toString(),
      name: buttonName ? buttonName(a) : a.toString(),
      htmlAttributes: config?.buttonHtmlAttributes && config.buttonHtmlAttributes(a),
    }))}
    title={title || SelectorMessage.ChooseValues.niceToString()}
    message={message ?? SelectorMessage.PleaseSelectAtLeastOneValueToContinue.niceToString()}
    size={size}
    dialogClassName={dialogClassName}
    multiSelect={true}
  />);
};

SelectorModal.chooseType = (options: TypeInfo[], config?: SelectorConfig<TypeInfo>): Promise<TypeInfo | undefined> => {
  return SelectorModal.chooseElement(options,
    {
      buttonDisplay: a => a.niceName ?? "",
      buttonName: a => a.name,
      title: SelectorMessage.TypeSelector.niceToString(),
      message: SelectorMessage.PleaseSelectAType.niceToString(),
      ...config
    });
};

SelectorModal.chooseEnum = <T extends string>(enumType: EnumType<T>, values?: T[], config?: SelectorConfig<T>): Promise<T | undefined> => {
    return SelectorModal.chooseElement(values ?? enumType.values(),
      {
        buttonDisplay: a => enumType.niceToString(a),
        buttonName: a => a,
        title: SelectorMessage._0Selector.niceToString(enumType.niceTypeName()),
        message: SelectorMessage.PleaseChooseA0ToContinue.niceToString(enumType.niceTypeName()),
        size: "md",
        ...config
      });
};

SelectorModal.chooseLite = <T extends Entity>(type: Type<T> | TypeInfo | string, values?: Lite<T>[], config?: SelectorConfig<Lite<T>>): Promise<Lite<T> | undefined> => {
  const ti = getTypeInfo(type);
  return (values ? Promise.resolve(values) : Finder.API.fetchAllLites({ types: ti.name }))
    .then(lites => SelectorModal.chooseElement<Lite<T>>(lites as Lite<T>[],
      {
        buttonDisplay: a => getToString(a),
        buttonName: a => liteKey(a),
        title: SelectorMessage._0Selector.niceToString(ti.niceName),
        message: SelectorMessage.PleaseChooseA0ToContinue.niceToString(ti.niceName),
        size: "md",
        ...config
      }));
};


export interface SelectorConfig<T> {
  buttonName?: (val: T) => string; //For testing
  buttonDisplay?: (val: T) => React.ReactNode;
  buttonHtmlAttributes?: (val: T) => React.HTMLAttributes<HTMLButtonElement>; //For testing
  title?: React.ReactNode;
  message?: React.ReactNode;
  size?: BsSize;
  dialogClassName?: string;
  forceShow?: boolean;
}



