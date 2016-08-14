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
			var calendar = create(Calendar);
			this._components["calendar"] = calendar._;
			super.initRestriction();
			this.setRestrictions({
				"timeBar": {
					"set": (value: any) => {
						calendar._set("timeBar", !!value);
					},
					"get": (): any => {
						return !!calendar.get("timeBar");
					}
				},
				"text": {
					"set":  (value: any) => {},
					"get": (): any => {
						var value = this.get("value");
						if (value === null)
							return "";
						return time.formatDate(value, this.get("format"));
					}
				}
			});
		}
		
		protected init(): void {
			super.init();
			this.setInit("format", "yyyy-MM-dd");
			this.setInit("iconRight", "fa-calendar");
			var calendar = <Calendar>get(this._components["calendar"]);
			
			var container = document.createElement("div"); 
			var toolbar = <HTMLElement>container.appendChild(document.createElement("div"));
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
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					this.closeSelect();
					this._.focus();
				} else if (name === "clear") {
					this.set("value", null);
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
			var clearButton = " | <a name='clear'><i class='fa fa-trash-o'></i> " + tui.str("Clear") + "</a>";
			var clearable = this.get("clearable");
			calendar._.style.outline = "none";
			toolbar.style.display = "";
			if (clearable)
				toolbar.innerHTML = todayButton + clearButton;
			else
				toolbar.innerHTML = todayButton;
			
			popup.open(this._, "Rb");
			setTimeout(() => {
				calendar._.focus();
				calendar.set("value", this.get("value"));
			});
		}
	}
	
	
	register(DatePicker);
}