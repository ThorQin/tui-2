/// <reference path="../../tui2.d.ts" />
declare module tui.widget.ext {
    class Location extends Widget implements Validatable {
        private _geocoder;
        private _selectedAddress;
        private _map;
        static initApi(): void;
        protected initRestriction(): void;
        protected initChildren(childNodes: Node[]): void;
        private initMap();
        protected init(): void;
        reset(): void;
        updateEmptyState(empty: boolean): void;
        validate(e?: JQueryEventObject): boolean;
        render(): void;
    }
}
declare function tui_widget_ext_Location_initApi(): void;
