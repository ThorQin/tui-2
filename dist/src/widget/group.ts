/// <reference path="button.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <group>
	 * Attributes: name, type(check,radio,toggle)
	 * Events: 
	 */
	export class Group extends Widget {
		
		protected initChildren(childNodes: Node[]) {
			for (let node of childNodes) {
				this._.appendChild(node);
			}
		}
		
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
						if (typeof value === "object" && value !== null) {
							var children = search(this._);
							for (let item of children) {
								var key = item.get("name");
								if (key !== null) {
									item.set("value", value[key]);
								}
							}
						}
					},
					"get": (): any => {
						var value: any = {};
						var children = search(this._);
						for (let item of children) {
							var key = item.get("name");
							if (key !== null) {
								value[key] = item.get("value");
							}
						}
						return value;
					}
				}
			});
		}

		protected init(): void {
			widget.init(this._);
		}
		
		render(): void {
			var root = this._;
			var result = search(root);
			for (let child of result) {
				child.render();
			}
		}
	}


	
	export class ButtonGroup extends Group {
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
						var children = search(this._, (elem: Widget): boolean => {
							if (elem.get("parent") === this && elem instanceof Button)
								return true;
							else
								return false;
						});
						function check(v: any): boolean {
							if (value instanceof Array) {
								return value.indexOf(v) >= 0;
							} else {
								return value === v;
							}
						}
						var radio = (this.get("type") === "radio");
						for (let button of children) {
							if (check(button.get("value"))) {
								button.set("checked", true);
							} else
								button.set("checked", false);
						}
					},
					"get": (): any => {
						var values: any[] = [];
						var children = search(this._, (elem: Widget): boolean => {
							if (elem.get("parent") === this && elem instanceof Button)
								return true;
							else
								return false;
						});
						for (let button of children) {
							if (button.get("checked"))
								values.push(button.get("value"));
						}
						if (this.get("type") === "radio" || this.get("type") === "toggle-radio") {
							if (values.length > 0)
								return values[0];
							else
								return null;
						} else
							return values;
					}
				},
				"text": {
					"get": (): any => {
						var values: any[] = [];
						var children = search(this._, (elem: Widget): boolean => {
							if (elem.get("parent") === this && elem instanceof Button)
								return true;
							else
								return false;
						});
						for (let button of children) {
							if (button.get("checked"))
								values.push(button.get("text"));
						}
						return values.join(",");
					}
				}
			});
		}
		
	}
	
	register(Group, "group");
	register(ButtonGroup, "button-group");

}