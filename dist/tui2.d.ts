/// <reference path="../src/jquery.d.ts" />
declare module tui {
    const UNDEFINED: string;
    var lang: string;
    /**
     * Register a translation dictionary.
     */
    function dict(lang: string, dictionary: {
        [index: string]: string;
    }, replace?: boolean): void;
    /**
     * Multi-language support, translate source text to specified language(default use tui.lang setting)
     * @param str {string} source text
     * @param lang {string} if specified then use this parameter as objective language otherwise use tui.lang as objective language
     */
    function str(str: string, lang?: string): string;
    var tuid: () => string;
    interface EventInfo {
        event: string;
        data: any;
    }
    interface EventHandler {
        (data: EventInfo): any;
        isOnce?: boolean;
    }
    /**
     * Base object, all other control extended from this base class.
     */
    class EventObject {
        private _events;
        /**
         * Register event handler.
         * @param {string} eventName
         * @param {EventHandler} handler Which handler to be registered
         * @param {boolean} atFirst If true then handler will be triggered firstly
         */
        bind(eventName: string, handler: EventHandler, atFirst: boolean): EventObject;
        /**
         * Unregister event handler.
         * @param eventName
         * @param handler Which handler to be unregistered if don't specified then unregister all handler
         */
        unbind(eventName: string, handler?: EventHandler): EventObject;
        /**
         * Register event handler.
         * @param {string} eventName
         * @param {callback} callback Which handler to be registered
         * @param {boolean} atFirst If true then handler will be triggered firstly
         */
        on(eventName: string, callback: EventHandler, atFirst?: boolean): EventObject;
        /**
         * Register event handler.
         * @param eventName
         * @param callback Which handler to be registered but event only can be trigered once
         * @param atFirst If true then handler will be triggered firstly
         */
        once(eventName: string, callback: EventHandler, atFirst?: boolean): EventObject;
        /**
         * Unregister event handler.
         * @param eventName
         * @param callback Which handler to be unregistered if don't specified then unregister all handler
         */
        off(eventName: string, callback?: EventHandler): EventObject;
        offAll(): void;
        /**
         * Fire event. If some handler process return false then cancel the event channe and return false either
         * @param {string} eventName
         * @param {any[]} param
         * @return {boolean} If any handler return false then stop other processing and return false either, otherwise return true
         */
        fire(eventName: string, data?: any): boolean;
    }
    const event: EventObject;
    /**
     * Deeply copy an object to an other object, but only contain properties without methods
     */
    function clone(obj: any, excludeProperties?: any): any;
    /**
     * Get IE version
     * @return {Number}
     */
    var ieVer: number;
    /**
     * Get Firefox version
     * @return {Number}
     */
    var ffVer: number;
}
declare module tui.text {
    /**
     * Convert anything to boolean
     */
    function parseBoolean(value: any): boolean;
    /**
     * Format a string use a set of parameters
     */
    function format(token: string, ...params: any[]): string;
    /**
     * Convert 'aaaBbbCcc' to 'aaa-bbb-ccc'
     */
    function toDashSplit(word: string): string;
    /**
     * Convert 'aaa-bbb-ccc' or 'aaa_bbb_ccc' to 'aaaBbbCcc'
     */
    function toCamel(word: string, strict?: boolean): string;
    /**
     * Format a number that padding it with '0'
     */
    function paddingNumber(v: number, min: number, max?: number, alignLeft?: boolean): string;
    /**
     * Get the parameter of the URL query string.
     * @param {String} url
     * @param {String} key Parameter name
     */
    function getUrlParam(url: string, key: string): string;
    /**
     * Get the anchor of the URL query string.
     * @param {String} url
     */
    function getUrlAnchor(url: string): string;
    function isAbsUrl(url: string): boolean;
    function getBaseUrl(url: string): string;
    function joinUrl(...urls: string[]): string;
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
    /**
     * Get top window's body element
     */
    function getTopBody(): Element;
    /**
     * Get element's owner window
     */
    function getWindow(elem: HTMLElement): any;
    function getWindowScrollElement(): HTMLElement;
    function keepToTop(elem: HTMLElement, top?: number): void;
    function cancelKeepToTop(elem: HTMLElement): void;
    function getCurrentStyle(elem: HTMLElement): CSSStyleDeclaration;
    /**
     * Test whether the button code is indecated that the event is triggered by a left mouse button.
     */
    function isLButton(e: any): boolean;
    /**
     * Prevent user press backspace key to go back to previous page
     */
    function banBackspace(): void;
    function cancelDefault(event: any): boolean;
    function cancelBubble(event: any): boolean;
    /**
     * Detect whether the given parent element is the real ancestry element
     * @param elem
     * @param parent
     */
    function isAncestry(elem: Node, parent: Node): boolean;
    /**
     * Detect whether the given child element is the real posterity element
     * @param elem
     * @param child
     */
    function isPosterity(elem: Node, child: Node): boolean;
    function isFireInside(elem: Node, event: any): boolean;
    /**
     * Detect whether the element is inside the document
     * @param {type} elem
     */
    function isInDoc(elem: HTMLElement): boolean;
    /**
     * Set cookie value
     * @param name
     * @param value
     * @param expires valid days
     */
    function saveCookie(name: string, value: any, expires?: number, path?: string, domain?: string, secure?: boolean): void;
    /**
     * Get cookie value
     * @param name
     */
    function loadCookie(name: string): any;
    /**
     * Delete cookie
     * @param name
     */
    function deleteCookie(name: string, path?: string, domain?: string): void;
    /**
     * Save key value into local storage, if local storage doesn't usable then use local cookie instead.
     * @param {String} key
     * @param {String} value
     * @param {Boolean} sessionOnly If true data only be keeped in this session
     */
    function saveData(key: string, value: any, sessionOnly?: boolean): void;
    /**
     * Load value from local storage, if local storage doesn't usable then use local cookie instead.
     * @param {String} key
     * @param {Boolean} sessionOnly If true data only be keeped in this session
     */
    function loadData(key: string, sessionOnly?: boolean): any;
    /**
     * Remove value from local storage, if local storage doesn't usable then use local cookie instead.
     * @param key
     * @param {Boolean} sessionOnly If true data only be keeped in this session
     */
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
    function use(fn: (...argv: any[]) => void, desc?: string): void;
    function load(services: string[], names?: string[]): void;
    function register(name: string, fn: Function): void;
    function ready(): void;
    function get(name: string): any;
    function onReady(fn: Function): void;
}
declare module tui.widget {
    function getEventPosition(e: JQueryEventObject): {
        x: number;
        y: number;
    }[];
    /**
     * Show a mask layer to prevent user drag or select document elements which don't want to be affected.
     * It's very useful when user perform a dragging operation.
     */
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
        /**
         * Only non-existing property will be set,
         * this method usually be called in init() method and will not cause the object redraw.
         */
        setInit(data: any): WidgetBase;
        setInit(key: string, value: any): WidgetBase;
    }
    abstract class Widget extends WidgetBase {
        private _lastWidth;
        private _lastHeight;
        protected _components: {
            [index: string]: HTMLElement;
        };
        _: HTMLElement;
        protected init(): void;
        appendTo(parent: HTMLElement, refresh?: boolean): Widget;
        detach(): void;
        protected initChildren(childNodes: Node[]): void;
        protected initRestriction(): void;
        testResize(): void;
        getComponent(name?: string): HTMLElement;
        focus(): void;
        constructor(root: HTMLElement, initParam?: {
            [index: string]: any;
        });
    }
    /**
     * Any config element can extends from this class.
     */
    class Item extends WidgetBase {
        _: HTMLElement;
        constructor(root: HTMLElement);
        getComponent(name?: string): HTMLElement;
        render(): void;
    }
    function register(constructor: {
        new (elem: HTMLElement, initParam?: {
            [index: string]: any;
        }): any;
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
}
declare module tui {
    var get: typeof widget.get;
    var create: typeof widget.create;
    var search: typeof widget.search;
}
declare module tui.widget {
    var dialogStack: Dialog[];
    interface DialogButton {
        name: string;
        className?: string;
        click?: (e: EventInfo) => void;
    }
    /**
     * <dialog>
     * Attributes: content(element or html), opened(boolean), title, buttons(button array), esc(boolean)
     * Method: open(buttonDef: string = null), close()
     * Events: open, close, click-<button name>
     */
    class Dialog extends Widget {
        private _sizeTimer;
        private _contentSize;
        private _moved;
        private _init;
        protected initChildren(childNodes: Node[]): void;
        protected init(): void;
        setContent(content: any): void;
        setButtons(buttonDef?: string): void;
        open(buttonDef?: string): void;
        close(): void;
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
    function startRouter(rules: RouterRule[], handler: RouterHandler): void;
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
        /**
        * Gets response from iframe and fires onComplete event when ready
        * @param iframe
        * @param file Filename to use in onComplete callback
        */
        private processResponse(iframe, file);
        private fireInvalidError();
        private fireError(errorMessage?);
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
declare module tui.time {
    var shortWeeks: string[];
    var weeks: string[];
    var shortMonths: string[];
    var months: string[];
    /**
     * Get today
     */
    function now(): Date;
    /**
     * Input seconds and get a time description
     * @param seconds Tims distance of seconds
     * @param lang Display language
     */
    function timespan(seconds: number, lang?: string): string;
    /**
     * Get the distance of dt2 compare to dt1 (dt2 - dt1) return in specified unit (d: day, h: hours, m: minutes, s: seconds, ms: milliseconds)
     * @param dt1
     * @param dt2
     * @param unit "d", "h", "m", "s" or "ms"
     */
    function dateDiff(dt1: Date, dt2: Date, unit?: string): number;
    /**
     * Get new date of dt add specified unit of values.
     * @param dt The day of the target
     * @param val Increased value
     * @param unit "y", "M", "d", "h", "m", "s" or "ms"
     */
    function dateAdd(dt: Date, val: number, unit?: string): Date;
    /**
     * Get day in year
     * @param dt The day of the target
     */
    function dayOfYear(dt: Date): number;
    /**
     * Get total days of month
     * @param dt The day of the target
     */
    function totalDaysOfMonth(dt: Date): number;
    /**
     * Parse string get date instance (
     * try to parse format:
     *		yyyy-MM-dd HH:mm:ss，
     *		yyyy-MM-dd,
     *		dd MMM yyyy,
     *		MMM dd, yyyy,
     *		ISO8601 format)
     * @param {String} dtStr Data string
     */
    function parseDate(dtStr: string, format?: string): Date;
    /**
     * Convert date to string and output can be formated to ISO8601, RFC2822, RFC3339 or other customized format
     * @param dt {Date} Date object to be convert
     * @param dateFmt {String} which format should be apply, default use ISO8601 standard format
     */
    function formatDate(dt: Date, dateFmt?: string): string;
}
declare module tui.widget {
    /**
     * <button>
     * Attributes: value, text, type, checked, group, disable
     * Events: click, mousedown, mouseup, keydown, keyup
     */
    class Button extends Widget {
        protected initChildren(childNodes: Node[]): void;
        protected initRestriction(): void;
        protected init(): void;
        render(): void;
    }
    class Check extends Button {
        init(): void;
    }
    class Radio extends Button {
        init(): void;
    }
}
declare module tui.widget {
    class Calendar extends Widget {
        protected initRestriction(): void;
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
    /**
     * <group>
     * Attributes: name, type(check,radio,toggle)
     * Events:
     */
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
    abstract class InputBase extends Widget {
        protected _valid: boolean;
        protected _invalidMessage: string;
        protected _isEmpty: boolean;
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
    /**
     * <tui:date-picker>
     * Attributes: value, text(value to string), format, timeBar
     * Method: openSelect
     * Events: change
     */
    class DatePicker extends SelectPopupBase {
        protected initRestriction(): void;
        protected init(): void;
        openSelect(): void;
    }
}
declare module tui.widget {
    class File extends InputBase {
        private static PADDING;
        private _uploader;
        protected initRestriction(): void;
        protected init(): void;
        render(): void;
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
        width?: number;
        fixed?: boolean;
        key?: string;
        type?: string;
        arrow?: boolean;
        sortable?: boolean;
        iconKey?: string;
        checkKey?: string;
        prefixKey?: string;
        suffixKey?: string;
    }
    /**
     * <tui:gird>
     * Attributes: data, list(array type data), tree(tree type data),
     * columns, sortColumn, sortType, scrollTop, scrollLeft, activeRow,
     * activeColumn
     * Method: scrollTo, setSortFlag
     * Events: sort, rowclick, rowdblclick, rowcheck, keyselect
     */
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
        protected init(): void;
        setSortFlag(col: number, type: string): void;
        scrollTo(index: number): void;
        iterate(func: (item: any, path: number[], treeNode: boolean) => boolean): void;
        /**
         * Search a row by condition, get field value by 'dataKey' and compare to value, if match then active it.
         * Should only used in local data type, e.g. List or Tree, if used in RemoteList or RemoteTree may not work correctly.
         */
        activeTo(dataKey: string, value: any): void;
        protected computeWidth(): number;
        protected computeScroll(): void;
        protected drawLine(line: HTMLElement, index: number, lineHeight: number, columns: ColumnInfo[], lineData: any): void;
        private moveLine(line, index, base, lineHeight);
        private createLine(parent);
        protected clearBuffer(): void;
        protected drawHeader(): void;
        private _drawTimer;
        protected drawContent(): void;
        protected initColumnWidth(): void;
        protected computeHOffset(): void;
        protected computeColumnWidth(): void;
        render(): void;
    }
    /**
     * <tui:list>
     */
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
    /**
     * <input>
     * Attributes: value, text, type, iconLeft, iconRight, autoValidate
     * Events: input, change, left-icon-mousedown, right-icon-mousedown, left-icon-click, right-icon-click
     */
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
    /**
     * <popup>
     * Attributes: content, direction, referPos, referElement, opened
     * Method: open(), close()
     * Events: open, close
     */
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
    /**
     * <menu>
     * Attributes: content, direction, referPos, referElement, opened
     * Method: open(), close()
     * Events: open, close, click
     */
    class Menu extends Popup {
        private activeItem;
        protected initChildren(childNodes: Node[]): void;
        open(refer: any, direction?: string): void;
        protected init(): void;
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
    /**
     * <tui:select>
     * Attributes: data, list, tree, multiSelect, checkKey, nameKey, canSearch, search
     * iconKey, valueKey
     * Method: openSelect
     * Events: change, click
     */
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
        private content;
        openSelect(): void;
        protected initChildren(childNodes: Node[]): void;
        protected createPopup(): any;
        protected init(): void;
    }
}
declare module tui.widget {
    /**
     * <input>
     * Attributes: value, text, type, iconLeft, iconRight, autoValidate
     * Events: input, change, left-icon-mousedown, right-icon-mousedown, left-icon-click, right-icon-click
     */
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
