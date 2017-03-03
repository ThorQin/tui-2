/// <reference path="../../tui2.d.ts" />
declare module tui.widget.ext {
    class Navigator extends Widget {
        private _activeItem;
        protected initRestriction(): void;
        protected initChildren(childNodes: Node[]): void;
        private checkScroll();
        protected init(): void;
        private collapse(elem);
        private expand(elem);
        private active(elem);
        private drawItems(parent, items, level);
        private _activeBy(parent, key, value);
        activeBy(key: string, value: string): void;
        render(): void;
    }
}
