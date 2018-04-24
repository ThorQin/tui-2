/// <reference path="../src/jquery.d.ts" />
declare module tui {
    const UNDEFINED: string;
    function setEnv(key: string, value: string): void;
    function getEnv(key: string): string;
    function isEnvKey(key: string): boolean;
    function useEnv(str: string): string;
    function elem(nodeName: string): HTMLElement;
    var lang: string;
    function dict(lang: string, dictionary: {
        [index: string]: string;
    }, replace?: boolean): void;
    function str(s: string, lang?: string): string;
    function strp(s: string, ...params: any[]): string;
    var tuid: () => string;
    interface EventInfo {
        event: string;
        data: any;
    }
    interface EventHandler {
        (data: EventInfo): any;
        isOnce?: boolean;
    }
    class EventObject {
        private _events;
        bind(eventName: string, handler: EventHandler, atFirst: boolean): EventObject;
        unbind(eventName: string, handler?: EventHandler): EventObject;
        on(eventName: string, callback: EventHandler, atFirst?: boolean): EventObject;
        once(eventName: string, callback: EventHandler, atFirst?: boolean): EventObject;
        off(eventName: string, callback?: EventHandler): EventObject;
        offAll(): void;
        fire(eventName: string, data?: any): boolean;
    }
    const event: EventObject;
    function clone(obj: any, excludeProperties?: any): any;
    var ieVer: number;
    var ffVer: number;
}
declare module tui.text {
    function parseBoolean(value: any): boolean;
    function format(token: string, ...params: any[]): string;
    function toDashSplit(word: string): string;
    function toCamel(word: string, strict?: boolean): string;
    function paddingNumber(v: number, min: number, max?: number, alignLeft?: boolean): string;
    function getUrlParam(url: string, key: string): string;
    function getUrlAnchor(url: string): string;
    function isAbsUrl(url: string): boolean;
    function getBaseUrl(url: string): string;
    function joinUrl(...urls: string[]): string;
    function arrayAdd(arr: any[], value: any): void;
    function arrayRemove(arr: any[], value: any): void;
}
declare module tui.browser {
    class BackupedScrollPosition {
        private backupInfo;
        constructor(target: HTMLElement);
        restore(): void;
    }
    function backupScrollPosition(target: HTMLElement): BackupedScrollPosition;
    function focusWithoutScroll(target: HTMLElement): void;
    function scrollToElement(elem: HTMLElement, ...param: any[]): void;
    function toElement(html: string, withParentDiv?: boolean): HTMLElement;
    function toHTML(node: NodeList): string;
    function toHTML(node: Node[]): string;
    function toHTML(node: Node): string;
    function hasClass(elem: HTMLElement, className: string): boolean;
    function addClass(elem: HTMLElement, classNames: string): void;
    function removeClass(elem: HTMLElement, classNames: string): void;
    function removeNode(node: Node): void;
    function toSafeText(text: string): string;
    function getNodeText(elem: any): string;
    function setNodeText(elem: any, text: string): void;
    function getNodeOwnText(elem: any): string;
    interface Size {
        width: number;
        height: number;
    }
    interface Position {
        left: number;
        top: number;
    }
    interface Rect extends Position, Size {
    }
    function getRectOfParent(elem: HTMLElement): Rect;
    function getRectOfPage(elem: HTMLElement): Rect;
    function getRectOfScreen(elem: HTMLElement): Rect;
    function getTopBody(): Element;
    function getWindow(elem: HTMLElement): any;
    function getWindowScrollElement(): HTMLElement;
    function keepToTop(elem: HTMLElement, top?: number): void;
    function cancelKeepToTop(elem: HTMLElement): void;
    function getCurrentStyle(elem: HTMLElement): CSSStyleDeclaration;
    function isLButton(e: any): boolean;
    function banBackspace(): void;
    function isAncestry(elem: Node, parent: Node): boolean;
    function isPosterity(elem: Node, child: Node): boolean;
    function isFireInside(elem: Node, event: any): boolean;
    function isInDoc(elem: HTMLElement): boolean;
    function saveCookie(name: string, value: any, expires?: number, path?: string, domain?: string, secure?: boolean): void;
    function loadCookie(name: string): any;
    function deleteCookie(name: string, path?: string, domain?: string): void;
    function saveData(key: string, value: any, sessionOnly?: boolean): void;
    function loadData(key: string, sessionOnly?: boolean): any;
    function deleteData(key: string, sessionOnly?: boolean): void;
    function addAccelerate(key: string, actionId: string): void;
    function deleteAccelerate(key: string, actionId: string): void;
    function getUrlParam(key: string): string;
    function getEventPosition(e: JQueryEventObject, allFingers?: boolean): {
        x: number;
        y: number;
        id?: any;
    }[];
    function setInnerHtml(elem: HTMLElement, content: string): void;
    function safeExec(code: string, context?: {
        [key: string]: any;
    }): void;
}
declare module tui.browser {
    enum KeyCode {
        BACK = 8,
        TAB = 9,
        ENTER = 13,
        SHIFT = 16,
        CTRL = 17,
        ALT = 18,
        PAUSE = 19,
        CAPS = 20,
        ESCAPE = 27,
        SPACE = 32,
        PRIOR = 33,
        NEXT = 34,
        END = 35,
        HOME = 36,
        LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40,
        PRINT = 44,
        INSERT = 45,
        DELETE = 46,
        KEY_0 = 48,
        KEY_1 = 49,
        KEY_2 = 50,
        KEY_3 = 51,
        KEY_4 = 52,
        KEY_5 = 53,
        KEY_6 = 54,
        KEY_7 = 55,
        KEY_8 = 56,
        KEY_9 = 57,
        SEMICOLON = 59,
        EQUALS = 61,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        WINDOWS = 91,
        NUM_0 = 96,
        NUM_1 = 97,
        NUM_2 = 98,
        NUM_3 = 99,
        NUM_4 = 100,
        NUM_5 = 101,
        NUM_6 = 102,
        NUM_7 = 103,
        NUM_8 = 104,
        NUM_9 = 105,
        NUM_MUL = 106,
        NUM_PLUS = 107,
        NUM_MINUS = 109,
        NUM_DOT = 110,
        NUM_DIV = 111,
        F1 = 112,
        F2 = 113,
        F3 = 114,
        F4 = 115,
        F5 = 116,
        F6 = 117,
        F7 = 118,
        F8 = 119,
        F9 = 120,
        F10 = 121,
        F11 = 122,
        F12 = 123,
        DASH = 173,
        COMMA = 188,
        PERIOD = 190,
        SLASH = 191,
        GRAVE = 192,
        LEFT_BRACKET = 219,
        BACKSLASH = 220,
        RIGHT_BRACKET = 221,
        QUOTE = 222,
    }
}
declare module tui.service {
    function parseParameters(fn: Function, desc?: string): string;
    class Service extends EventObject {
        _constructor: Function;
        use(fn: (...argv: any[]) => void, desc?: string): void;
    }
    function use(fn: (...argv: any[]) => void, desc?: string): void;
    function load(services: string[], names?: string[]): void;
    function register(name: string, fn: Function): Service;
    function unregister(name: string): void;
    function ready(): void;
    function get(name: string): any;
    function onReady(fn: Function): void;
}
declare module tui.widget {
    function getEventPosition(e: JQueryEventObject): {
        x: number;
        y: number;
    }[];
    function openDragMask(onMove: (e: JQueryEventObject) => void, onClose?: (e: JQueryEventObject) => void): HTMLDivElement;
}
declare module tui.widget {
    interface PropertyControl {
        get?(): any;
        set?(value: any): void;
    }
    abstract class WidgetBase extends EventObject {
        protected _data: {
            [index: string]: any;
        };
        protected _rs: {
            [index: string]: PropertyControl;
        };
        abstract getComponent(name?: string): HTMLElement;
        abstract render(): void;
        protected setRestriction(key: string, propCtrl: PropertyControl): void;
        protected setRestrictions(restrictions: {
            [index: string]: PropertyControl;
        }): void;
        refresh(): WidgetBase;
        protected load(): void;
        get(key?: string, defaultValue?: any): any;
        set(data: any): WidgetBase;
        set(key: string, value: any): WidgetBase;
        _set(data: any): WidgetBase;
        _set(key: string, value: any): WidgetBase;
        setInit(data: any): WidgetBase;
        setInit(key: string, value: any): WidgetBase;
    }
    abstract class Widget extends WidgetBase {
        private _lastWidth;
        private _lastHeight;
        private _lastParentWidth;
        private _lastParentHeight;
        protected _components: {
            [index: string]: HTMLElement;
        };
        _: HTMLElement;
        protected init(): void;
        appendTo(parent: HTMLElement, refresh?: boolean): Widget;
        addClass(className: string): void;
        removeClass(className: string): void;
        detach(): void;
        protected initChildren(childNodes: Node[]): void;
        protected initRestriction(): void;
        testResize(): void;
        testParentResize(): void;
        getComponent(name?: string): HTMLElement;
        focus(): void;
        constructor(root: HTMLElement, initParam?: {
            [index: string]: any;
        });
    }
    class Item extends WidgetBase {
        _: HTMLElement;
        constructor(root: HTMLElement);
        getComponent(name?: string): HTMLElement;
        render(): void;
    }
    function register(constructor: {
        new (elem: HTMLElement, initParam?: {
            [index: string]: any;
        }): Widget;
    }, nodeName: string): void;
    function get(id: any): Widget;
    function create(type: string, initParam?: {
        [index: string]: any;
    }): Widget;
    function getClassName(func: Function): string;
    function getFullName(targetElem: any): string;
    function init(parent: HTMLElement, initFunc?: (widget: Widget) => boolean): void;
    function search(filter: (elem: Widget) => boolean): Widget[];
    function search(searchArea: HTMLElement): Widget[];
    function search(searchArea: HTMLElement, filter: (elem: Widget) => boolean): Widget[];
    function registerResize(nodeName: string): void;
    function registerParentResize(nodeName: string): void;
}
declare module tui {
    var get: typeof widget.get;
    var create: typeof widget.create;
    var search: typeof widget.search;
}
declare module tui.widget {
    interface FormItem {
        type: string;
        label?: string | null;
        key?: string | null;
        value?: any;
        condition?: string;
        size?: number;
        position?: string;
        disable?: boolean;
        required?: boolean;
        emphasize?: boolean;
        description?: string;
        [index: string]: any;
    }
    interface FormControlConstructor {
        new (form: Form, define: FormItem): FormControl<FormItem>;
        icon: string;
        desc: string;
        order: number;
        init?: {
            [index: string]: any;
        };
        translator?: (value: any, item: any, index: number) => Node;
    }
    class Form extends Widget {
        static ITEM_SIZE: number;
        protected _definitionChanged: boolean;
        protected _valueChanged: boolean;
        protected _items: FormControl<FormItem>[];
        protected _scripts: {
            [index: string]: string;
        };
        protected _valueCache: {
            [index: string]: any;
        };
        protected _maxId: number;
        private _autoResizeTimer;
        private _parentWidth;
        private _formulaContext;
        static register(type: string, controlType: FormControlConstructor): void;
        static getType(type: string): FormControlConstructor;
        removeAll(): void;
        protected hideAll(): void;
        selectItem(target: FormControl<FormItem>): void;
        getItem(index: number | string): FormControl<FormItem>;
        getSelectedItem(): FormControl<FormItem>;
        setScript(key: string, formula: string): void;
        removeScript(key: string): void;
        getScript(key: string): string;
        addItem(type: string, label?: string, pos?: number): void;
        removeItem(target: FormControl<FormItem>): void;
        getItemIndex(target: FormControl<FormItem>): number;
        selectNext(): boolean;
        selectPrevious(): boolean;
        protected update(): void;
        protected initRestriction(): void;
        protected init(): void;
        private computeSize();
        private bindNewItemClick(popup, newItemDiv, type, pos);
        private addNewItem(button, pos);
        validate(): boolean;
        render(): void;
    }
}
declare module tui {
    function inputbox(define: widget.FormItem[], title?: string, initValue?: any, callback?: (value: any) => JQueryPromise<any> | boolean, maxWidth?: number): widget.Dialog;
}
declare module tui.widget {
    var dialogStack: Dialog[];
    interface DialogButton {
        name: string;
        className?: string;
        click?: (e: EventInfo) => void;
    }
    class Dialog extends Widget {
        private _sizeTimer;
        private _contentSize;
        private _moved;
        private _init;
        private _calc;
        protected initRestriction(): void;
        protected initChildren(childNodes: Node[]): void;
        protected init(): void;
        setContent(content: any, render?: boolean): void;
        setButtons(buttonDef?: string, render?: boolean): void;
        open(buttonDef?: string): Dialog;
        close(): Dialog;
        render(): void;
    }
}
declare module tui {
    function msgbox(message: string, title?: string): widget.Dialog;
    function infobox(message: string, title?: string): widget.Dialog;
    function okbox(message: string, title?: string): widget.Dialog;
    function errbox(message: string, title?: string): widget.Dialog;
    function warnbox(message: string, title?: string): widget.Dialog;
    function askbox(message: string, title?: string, callback?: (result: boolean) => void): widget.Dialog;
    function waitbox(message: string): {
        close: () => void;
        setMessage: (message: string) => void;
    };
    function progressbox(message: string, cancelProc?: () => {}): widget.Dialog;
}
declare module tui.ajax {
    function send(url: string, method: string, data?: any, options?: {
        [index: string]: any;
    }): JQueryDeferred<any>;
    function post(url: string, data: any, options?: {
        [index: string]: any;
    }): JQueryDeferred<any>;
    function post_(url: string, data: any, options?: {
        [index: string]: any;
    }): JQueryDeferred<any>;
    function get(url: string, options?: {
        [index: string]: any;
    }): JQueryDeferred<any>;
    function get_(url: string, options?: {
        [index: string]: any;
    }): JQueryDeferred<any>;
    function getScript(url: string): JQueryDeferred<any>;
    function getBody(url: string): JQueryDeferred<any>;
    function getComponent(url: string): JQueryDeferred<any>;
    function getFunction(url: string, param?: any): JQueryDeferred<any>;
}
declare module tui.browser {
    interface RouterHandler {
        (state: string, hash: string, url?: string): boolean;
    }
    interface RouterRule {
        state: string;
        url?: string;
        handler?: RouterHandler;
    }
    function startRouter(rules: RouterRule[], handler: RouterHandler): service.Service;
    function stopRouter(): void;
}
declare module tui.browser {
    interface UploadOptions {
        action: string;
        name: string;
        multiple?: boolean;
        accept?: string;
        autoSubmit?: boolean;
    }
    class Uploader extends EventObject {
        private _settings;
        private _container;
        private _input;
        constructor(container: HTMLElement, options?: UploadOptions);
        setOptions(options: UploadOptions): void;
        getOptions(): UploadOptions;
        private createIframe();
        private createForm(iframe);
        createInput(): void;
        deleteInput(): void;
        getInput(): HTMLInputElement;
        private clearInput();
        private processResponse(iframe, file);
        private fireInvalidError();
        private fireError(errorMessage?);
        uploadV5(file: string, fileObject: File, extraData?: {
            [index: string]: string;
        }): void;
        private submitV5(file, extraData?);
        private submitV4(file, extraData?);
        submit(extraData?: {
            [index: string]: string;
        }): void;
    }
    function createUploader(container: HTMLElement, options?: UploadOptions): Uploader;
}
declare module tui.ds {
    interface Order {
        key: string;
        desc: boolean;
    }
    interface Filter {
        key: string;
        value: string;
    }
    interface DS {
        length(): number;
        get(index: number): any;
        setOrder(order: Order[]): void;
        getOrder(): Order[];
        setFilter(filter: Filter[]): void;
        getFilter(): Filter[];
    }
    interface TreeDS extends DS {
        expand(index: number): void;
        collapse(index: number): void;
    }
    abstract class DSBase extends EventObject {
        protected _finalData: any[];
        protected _order: Order[];
        protected _filter: Filter[];
        setOrder(order: Order[]): void;
        getOrder(): Order[];
        setFilter(filter: Filter[]): void;
        getFilter(): Filter[];
        protected abstract build(): void;
    }
    class List extends DSBase implements DS {
        private _data;
        constructor(data: any[], filter?: Filter[], order?: Order[]);
        length(): number;
        get(index: number): any;
        protected build(): void;
    }
    interface QueryResult {
        length: number;
        begin: number;
        data: any[];
    }
    class RemoteList extends DSBase implements DS {
        private _cache1;
        private _cache2;
        private _length;
        private _cacheSize;
        private _fillCache;
        private _queryTimer;
        constructor(cacheSize?: number, filter?: Filter[], order?: Order[]);
        length(): number;
        get(index: number): any;
        private getIndexPage(index);
        private getFromCache(index, cache);
        update(result: QueryResult): void;
        reset(): void;
        protected build(): void;
    }
    interface TreeNode {
        parent: TreeNode;
        hasChild: boolean;
        item: any;
        level: number;
        expand: boolean;
    }
    interface TreeConfig {
        children: string;
        expand: string;
        hasChild?: string;
    }
    abstract class TreeBase extends DSBase implements TreeDS {
        protected _config: TreeConfig;
        protected _index: TreeNode[];
        protected _rawData: any[];
        getConfig(): TreeConfig;
        length(): number;
        getRawData(): any[];
        get(index: number): TreeNode;
        protected findNodeIndex(node: TreeNode): number;
        protected expandItems(parent: TreeNode, items: any[], index: TreeNode[], level: number, init?: boolean): void;
        protected getExpandCount(children: any[]): number;
        expand(index: number): void;
        collapse(index: number): void;
    }
    class Tree extends TreeBase {
        constructor(data: any[], config?: TreeConfig, filter?: Filter[], order?: Order[]);
        update(data: any[]): void;
        protected build(): void;
    }
    interface TreeQueryResult {
        parent: TreeNode;
        data: any[];
    }
    class RemoteTree extends TreeBase {
        private _querying;
        constructor(config?: TreeConfig, filter?: Filter[], order?: Order[]);
        length(): number;
        expand(index: number): void;
        update(result: TreeQueryResult): void;
        protected build(): void;
    }
}
declare module tui.text.exp {
    interface Evaluator {
        (variable: string): any;
    }
    function evaluate(expression: string, evaluator: Evaluator): boolean;
}
declare module tui.time {
    var shortWeeks: string[];
    var weeks: string[];
    var shortMonths: string[];
    var months: string[];
    function now(): Date;
    function timespan(seconds: number, lang?: string): string;
    function dateDiff(dt1: Date, dt2: Date, unit?: string): number;
    function dateAdd(dt: Date, val: number, unit?: string): Date;
    function dayOfYear(dt: Date): number;
    function totalDaysOfMonth(dt: Date): number;
    function parseDate(dtStr: string, format?: string): Date;
    function formatDate(dt: Date, dateFmt?: string): string;
}
declare module tui.widget {
    class Button extends Widget {
        protected initChildren(childNodes: Node[]): void;
        protected initRestriction(): void;
        protected init(): void;
        render(): void;
    }
    class Check extends Button {
        protected init(): void;
    }
    class Radio extends Button {
        protected init(): void;
    }
}
declare module tui.widget {
    class Calendar extends Widget {
        protected initRestriction(): void;
        private _monthOnly;
        protected makeTable(): void;
        protected init(): void;
        private onPicked(y, m, d);
        private makeTime(proc);
        prevMonth(): void;
        nextMonth(): void;
        prevYear(): void;
        nextYear(): void;
        render(): void;
    }
}
declare module tui.widget {
    class Group extends Widget {
        protected initChildren(childNodes: Node[]): void;
        protected initRestriction(): void;
        protected init(): void;
        render(): void;
    }
    class ButtonGroup extends Group {
        protected initRestriction(): void;
    }
}
declare module tui.widget {
    class Component extends Group {
        private _scriptReady;
        private _htmlReady;
        private _childrenInit;
        private _fn;
        private _changed;
        private _noReadyCount;
        private checkReady();
        protected initRestriction(): void;
        private getParentUrl();
        private loadComponents();
        protected initChildren(childNodes: Node[]): void;
        use(fn: (...arg: any[]) => void, desc?: string): void;
        render(): void;
    }
}
declare module tui.widget {
    interface Validatable {
        reset(): void;
        updateEmptyState(empty: boolean): void;
        validate(e?: JQueryEventObject): boolean;
    }
    abstract class InputBase extends Widget implements Validatable {
        protected _valid: boolean;
        protected _invalidMessage: string;
        protected _isEmpty: boolean;
        static parseValidators(childNodes: Node[]): any[];
        protected initChildren(childNodes: Node[]): void;
        reset(): void;
        updateEmptyState(empty: boolean): void;
        validate(e?: JQueryEventObject): boolean;
    }
}
declare module tui.widget {
    abstract class SelectBase extends InputBase {
        private static PADDING;
        abstract openSelect(): void;
        protected abstract createPopup(): any;
        protected _inSelection: boolean;
        closeSelect(): void;
        protected init(): void;
        render(): void;
    }
    abstract class SelectPopupBase extends SelectBase {
        protected createPopup(): any;
    }
}
declare module tui.widget {
    class DatePicker extends SelectPopupBase {
        protected initRestriction(): void;
        protected init(): void;
        openSelect(): void;
    }
}
declare module tui.widget {
    class File extends InputBase {
        private _uploader;
        protected initRestriction(): void;
        protected init(): void;
        render(): void;
    }
}
declare module tui.widget {
    class Files extends Widget {
        private _uploader;
        private _uploadBox;
        private _values;
        protected initRestriction(): void;
        protected init(): void;
        private bindRemove(removeIcon, fileIndex);
        private bindDownload(item, url);
        private bindReorder(item, fileItem);
        render(): void;
    }
}
declare module tui.widget {
    interface PropertyPage {
        name: string;
        properties: FormItem[];
        designMode?: boolean;
        form?: Form;
    }
    interface Calculator {
        cache: {
            [index: string]: any;
        };
        calc: (key: string, searchPath: string[]) => void;
        path: string[];
    }
    abstract class FormControl<D extends FormItem> {
        mask: HTMLElement;
        div: HTMLElement;
        label: HTMLElement;
        define: D;
        toolbar: HTMLElement;
        btnEdit: Button;
        btnDelete: Button;
        btnAdd: Button;
        btnSize: Button;
        btnPosition: Button;
        available: boolean;
        protected form: Form;
        protected selected: boolean;
        static detectRequired(pages: PropertyPage[], recentPage: number): void;
        static detectRequiredByValidation(pages: PropertyPage[], recentPage: number): void;
        constructor(form: Form, define: D);
        protected onPropertyPageSwitch(propertyPages: PropertyPage[], recentPage: number): void;
        showProperties(): void;
        update(): void;
        isPresent(): boolean;
        hide(): void;
        show(): void;
        setDesign(value: boolean): void;
        updateIndex(index: number): void;
        select(value: boolean): void;
        isSelect(): boolean;
        getKey(): string;
        applySize(): void;
        abstract getValue(cal: Calculator): any;
        abstract setValue(value: any): void;
        abstract isResizable(): boolean;
        abstract render(designMode: boolean): void;
        abstract getProperties(): PropertyPage[];
        abstract setProperties(properties: any[]): void;
        abstract validate(): boolean;
    }
    abstract class BasicFormControl<T extends Widget, D extends FormItem> extends FormControl<D> {
        protected _widget: T;
        protected _name: string;
        constructor(form: Form, define: D, type: string);
        update(): void;
        isResizable(): boolean;
        getValue(cal?: Calculator): any;
        setValue(value: any): void;
        render(designMode: boolean): void;
    }
}
declare module tui.widget {
    class Frame extends Widget {
        private _cache;
        protected initRestriction(): void;
        private _go(src, cache?, name?);
        go(src: string, cache?: boolean, name?: string): void;
        render(): void;
    }
}
declare module tui.widget {
    interface ColumnInfo {
        name: string;
        align?: string;
        width?: number;
        fixed?: boolean;
        key?: string;
        type?: string;
        checkCol?: string;
        arrow?: boolean;
        sortable?: boolean;
        iconKey?: string;
        checkKey?: string;
        prefixKey?: string;
        suffixKey?: string;
        translator?: (value: any, item: any, index: number, line: HTMLElement) => Node;
    }
    class Grid extends Widget {
        static CELL_SPACE: number;
        static LINE_HEIGHT: number;
        private _tuid;
        private _setupHeadMoveListener;
        private _vbar;
        private _hbar;
        private _dispLines;
        private _buffer;
        private _contentWidth;
        private _contentHeight;
        private _columnWidths;
        private _gridStyle;
        private _vLines;
        private _handlers;
        protected initRestriction(): void;
        getRowData(rowIndex: number): any;
        protected init(): void;
        updateCheckState(colIndex: number): void;
        setSortFlag(col: number, type: string): void;
        scrollTo(index: number): void;
        iterate(func: (item: any, path: number[], treeNode: boolean) => boolean): void;
        activeTo(dataKey: string, value: any): void;
        protected computeWidth(): number;
        protected computeScroll(): void;
        protected drawLine(line: HTMLElement, index: number, lineHeight: number, columns: ColumnInfo[], lineData: any): void;
        private moveLine(line, index, base, lineHeight);
        private createLine(parent);
        protected clearBuffer(): void;
        protected drawHeader(): void;
        private _drawTimer;
        private _clearTimes;
        protected drawContent(): void;
        protected initColumnWidth(): void;
        protected computeHOffset(): void;
        protected computeColumnWidth(): void;
        render(): void;
    }
    class List extends Grid {
        private _column;
        static LINE_HEIGHT: number;
        protected initRestriction(): void;
        protected init(): void;
        selectAll(): void;
        deselectAll(): void;
    }
}
declare module tui.widget {
    class Input extends InputBase {
        static PADDING: number;
        protected initRestriction(): void;
        private onInput(textbox, e);
        protected init(): void;
        focus(): void;
        render(): void;
    }
}
declare module tui.widget {
    var popStack: Popup[];
    class Popup extends Widget {
        private popIndex;
        private referRect;
        private checkInterval;
        protected initRestriction(): void;
        protected initChildren(childNodes: Node[]): void;
        protected init(): void;
        private refProc;
        open(refer: HTMLElement, direction?: string): void;
        open(refer: Position, direction?: string): void;
        private closeSelf();
        close(): void;
        render(): void;
    }
}
declare module tui.widget {
    class Menu extends Popup {
        private activeItem;
        protected initChildren(childNodes: Node[]): void;
        open(refer: any, direction?: string): void;
        protected init(): void;
    }
}
declare module tui.widget {
    class Picture extends Widget {
        private _uploader;
        protected initRestriction(): void;
        protected init(): void;
        render(): void;
    }
}
declare module tui.widget {
    class Scrollbar extends Widget {
        protected initRestriction(): void;
        protected init(): void;
        private posToValue(pos);
        private valueToPos(value);
        render(): void;
    }
}
declare module tui.widget {
    class Select extends SelectPopupBase {
        private static LIST_LINE_HEIGHT;
        protected initRestriction(): void;
        private changeSize();
        private getSelection(list);
        private updateTextByValue(list);
        protected init(): void;
        openSelect(): void;
    }
    class DialogSelect extends SelectBase {
        private dialog;
        openSelect(): void;
        protected initChildren(childNodes: Node[]): void;
        protected createPopup(): any;
        protected init(): void;
    }
}
declare module tui.widget {
    class Textarea extends InputBase {
        protected _lastTextHeight: number;
        protected initRestriction(): void;
        private onInput(textbox, e);
        protected init(): void;
        focus(): void;
        render(): void;
    }
}
declare module tui.widget {
    function showTooltip(target: HTMLElement, tooltip: string, pos: {
        x: number;
        y: number;
    }, update: boolean): void;
    function closeTooltip(): void;
    function whetherShowTooltip(target: HTMLElement, e: JQueryMouseEventObject): void;
    function whetherCloseTooltip(target: HTMLElement): void;
}
