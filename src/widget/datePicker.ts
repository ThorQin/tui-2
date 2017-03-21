/// <reference path="selectBase.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <tui:date-picker>
	 * Attributes: value, text(value to string), format, timeBar
	 * Method: openSelect
	 * Events: change
	 */
	export class DatePicker extends SelectPopupBase {
		
		protected initRestriction(): void {
			var calendar = create("calendar");
			this._components["calendar"] = calendar._;
			super.initRestriction();
			this.setRestrictions({
				"text": {
					"set":  (value: any) => {},
					"get": (): any => {
						var value = this.get("value");
						if (value === null)
							return "";
						return time.formatDate(value, this.get("format"));
					}
				},
				"mode": {
					"set":  (value: any) => {
						calendar.set("mode", value);
						if (value === "time") {
							this._set("iconRight", "fa-clock-o");
						} else
							this._set("iconRight", "fa-calendar");
					},
					"get": (): any => {
						return calendar.get("mode");
					}
				},
				"format": {
					"get": (): any => {
						var mode = this.get("mode");
						if (this._data["format"])
							return this._data["format"];
						else if (mode === "month") {
							return "yyyy - MM";
						} else if (mode === "date-time") {
							return "yyyy - MM - dd   HH : mm : ss";
						} else if (mode === "time") {
							return "HH : mm : ss";
						} else {
							return "yyyy - MM - dd";
						}
					}
				}
			});
		}
		
		protected init(): void {
			super.init();
			if (this.get("mode") === "time") {
				this._set("iconRight", "fa-clock-o");
			} else
				this._set("iconRight", "fa-calendar");
			var calendar = <Calendar>get(this._components["calendar"]);
			
			var container = elem("div"); 
			var toolbar = <HTMLElement>container.appendChild(elem("div"));
			toolbar.className = "tui-select-toolbar";
			container.insertBefore(calendar._, container.firstChild);
			
			var popup = <Popup>get(this._components["popup"]);
			popup._set("content", container);
			
			this._components["toolbar"] = <HTMLElement>toolbar;
			calendar._.style.display = "block";
			calendar._.style.borderWidth = "0";
			calendar.on("click", (e) => {
				this.set("value", calendar.get("value"));
				this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
				if (e.data.type === "pick") {
					this.closeSelect();
					this._.focus();
				}
			});
			$(toolbar).click((e)=>{
				var obj = <HTMLElement>(e.target || e.srcElement);
				var name = obj.getAttribute("name");
				if (name === "today") {
					this.set("value", time.now());
					calendar.set("value", this.get("value"));
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					this.closeSelect();
					this._.focus();
				} else if (name === "clear") {
					this.set("value", null);
					calendar.set("value", this.get("value"));
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					this.closeSelect();
					this._.focus();
				} else if (name === "ok") {
					this.set("value", calendar.get("value"));
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					this.closeSelect();
					this._.focus();
				}
			});
			
		}
		
		openSelect() {
			var calendar = <Calendar>get(this._components["calendar"]);
			var popup = <Popup>get(this._components["popup"]);
			//popup._set("content", list._);
			var toolbar = this._components["toolbar"];
			var todayButton = "<a name='today'>" + tui.str("Today") + "</a>";
			var okButton = "<a name='ok'>" + tui.str("ok") + "</a>";
			var clearButton = "<a name='clear'><i class='fa fa-trash-o'></i> " + tui.str("Clear") + "</a>";
			var clearable = this.get("clearable");
			calendar._.style.outline = "none";
			toolbar.style.display = "";
			if (clearable)
				toolbar.innerHTML = okButton + " | " + todayButton + " | " + clearButton;
			else
				toolbar.innerHTML = okButton + " | " + todayButton;
			
			popup.open(this._, "Lb");
			setTimeout(() => {
				calendar._.focus();
				calendar.set("value", this.get("value"));
			});
		}
	}
	
	
	register(DatePicker, "date-picker");
}