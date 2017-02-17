/// <reference path="base.ts" />
/// <reference path="../time/time.ts" />

module tui.widget {
	"use strict";
	
	function formatNumber (v: number, maxValue: number): string {
		if (v < 0)
			v = 0;
		if (v > maxValue)
			v = maxValue;
		if (v < 10)
			return "0" + v;
		else
			return v + "";
	}
	
	function setText(tb: HTMLTableElement, line: number, column: number, content: string) {
		var cell: HTMLTableCellElement = ((<any>tb.rows[line]).cells[column]);
		if (tui.ieVer > 0 && tui.ieVer < 9) {
			cell.innerText = content;
		} else
			cell.innerHTML = content;
	}

	export class Calendar extends Widget {
		
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"time": {
					"set": (value: any): void => {
						if (value instanceof Date)
							this._data["time"] = value;
						else if (typeof value === "string") {
							value = time.parseDate(value);
							this._data["time"] = value;
						}
					},
					"get": (): any => {
						var tm = this._data["time"];
						if (typeof tm === UNDEFINED || tm === null) {
							return this._data["time"] = time.now();
						} else
							return tm;
					}
				},
				"value": {
					"set": (value: any): void => {
						this._set("time", value);
					},
					"get": (): any => {
						return this.get("time");
					}
				},
				"year": {
					"set": (value: any): void => {
						if (typeof value === "number" && !isNaN(value))
							(<Date>this.get("time")).setFullYear(value);
					},
					"get": (): any => {
						return (<Date>this.get("time")).getFullYear();
					}
				},
				"month": {
					"set": (value: any): void => {
						if (typeof value === "number" && !isNaN(value))
							(<Date>this.get("time")).setMonth(value - 1);
					},
					"get": (): any => {
						return (<Date>this.get("time")).getMonth() + 1;
					}
				},
				"day": {
					"set": (value: any): void => {
						if (typeof value === "number" && !isNaN(value))
							(<Date>this.get("time")).setDate(value);
					},
					"get": (): any => {
						return (<Date>this.get("time")).getDate();
					}
				},
				"hour": {
					"set": (value: any): void => {
						if (typeof value === "number" && !isNaN(value))
							(<Date>this.get("time")).setHours(value);
					},
					"get": (): any => {
						return (<Date>this.get("time")).getHours();
					}
				},
				"minute": {
					"set": (value: any): void => {
						if (typeof value === "number" && !isNaN(value))
							(<Date>this.get("time")).setMinutes(value);
					},
					"get": (): any => {
						return (<Date>this.get("time")).getMinutes();
					}
				},
				"second": {
					"set": (value: any): void => {
						if (typeof value === "number" && !isNaN(value))
							(<Date>this.get("time")).setSeconds(value);
					},
					"get": (): any => {
						return (<Date>this.get("time")).getSeconds();
					}
				}
			});
		}

		protected init(): void {
			$(this._).attr({ "tabIndex": "0", "unselectable": "on"});
			var tb = this._components["table"] = <HTMLTableElement>browser.toElement(
				"<table cellPadding='0' cellspacing='0' border='0'>" +
				"<tr class='tui-yearbar'><td class='tui-pm'></td><td class='tui-py'>" +
				"</td><td colspan='3' class='tui-ym'></td>" +
				"<td class='tui-ny'></td><td class='tui-nm'></td></tr></table>");
			// var yearLine = tb.rows[0];
			
			for (var i = 0; i < 7; i++) {
				var line: HTMLTableRowElement = <HTMLTableRowElement>tb.insertRow(-1);
				for (var j = 0; j < 7; j++) {
					var cell: HTMLTableCellElement = <HTMLTableCellElement>line.insertCell(-1);
					if (j === 0 || j === 6)
						cell.className = "tui-week-end";
					if (i === 0) {
						cell.className = "tui-week";
						setText(tb, i + 1, j, tui.str(time.shortWeeks[j]));
					}
				}
			}
			this._.appendChild(tb);
			
			var timebar = this._components["timeBar"] = <HTMLTableElement>browser.toElement(
				"<div>" + tui.str("Choose Time") + ":<input name='hours' maxLength='2'>:<input name='minutes' maxLength='2'>:<input name='seconds' maxLength='2'>" +
				"<a class='tui-update'></a></div>");
			this._.appendChild(timebar);
			
			function getMaxValue(name: string): number {
				if (name === "hours")
					return 23;
				else
					return 59;
			}
			
			var getInputTime = () => {
				function getInput(index:number): any {
					return $(timebar).children("input")[index];
				}
				var tm = <Date>this.get("time");
				tm.setHours(parseInt(getInput(0).value));
				tm.setMinutes(parseInt(getInput(1).value));
				tm.setSeconds(parseInt(getInput(2).value));
				this.set("time", tm);
			};
			
			var timebar$ = $(timebar);
			timebar$.keydown((e) => {
				var o = <any>(e.srcElement || e.target);
				var o$ = $(o);
				var k = e.keyCode;
				if (o.nodeName.toUpperCase() === "INPUT") {
					if (k === browser.KeyCode.TAB)
						return;
					e.preventDefault();
					browser.cancelBubble(e);
					var input = <HTMLInputElement>o;
					if (k === browser.KeyCode.LEFT) {
						if (o$.attr("name") === "seconds")
							timebar$.children("input[name=minutes]").focus();
						else if (o$.attr("name") === "minutes")
							timebar$.children("input[name=hours]").focus();
					} else if (k === browser.KeyCode.RIGHT) {
						if (o$.attr("name") === "hours")
							timebar$.children("input[name=minutes]").focus();
						else if (o$.attr("name") === "minutes")
							timebar$.children("input[name=seconds]").focus();
					} else if (k === browser.KeyCode.UP) {
						let max = getMaxValue(o$.attr("name"));
						let v = parseInt(input.value) + 1;
						if (v > max) v = 0;
						input.value = formatNumber(v, max);
						getInputTime();
						input.select();
					} else if (k === browser.KeyCode.DOWN) {
						let max = getMaxValue(o$.attr("name"));
						let v = parseInt(input.value) - 1;
						if (v < 0) v = max;
						input.value = formatNumber(v, max);
						getInputTime();
						input.select();
					} else if (k >= browser.KeyCode.KEY_0 && k <= browser.KeyCode.KEY_9) {
						let max = getMaxValue(o$.attr("name"));
						let v = k - browser.KeyCode.KEY_0;
						let now = tui.time.now().getTime();
						if (o._lastInputTime && (now - o._lastInputTime) < 1000 )
							o.value = formatNumber(parseInt(o.value.substr(1,1)) * 10 + v, max);
						else
							o.value = formatNumber(v, max);
						o._lastInputTime = now;
						getInputTime();
						o.select();
					} else if (k == 13) 
						this.fire("click", {e:e,  "time": this.get("time"), "type": "pick" });
				} 
			});
			
			timebar$.children("input").on("focus mousedown mouseup", function(e){
				var o = <any>(e.srcElement || e.target);
				setTimeout(function (){
					o.select();
				},0);
			}).on("contextmenu", browser.cancelDefault);
			timebar$.children("a").mousedown((e) => {
				let now = time.now();
				let newTime = new Date(this.get("year"), this.get("month") - 1, this.get("day"),
					now.getHours(), now.getMinutes(), now.getSeconds());
				this.set("time", newTime);
				setTimeout(() => { this._.focus(); });
				return browser.cancelBubble(e);
			}).click((e) => {
				this.fire("click", {e:e, "time": this.get("time"), "type": "refresh"});
			});
			
			$(tb).mousedown((e) => {
				if (tui.ffVer > 0) {
					setTimeout(() => { this._.focus(); });
				}
				var cell = <any>(e.target || e.srcElement);
				if (cell.nodeName.toLowerCase() !== "td")
					return;
				if ($(cell).hasClass("tui-pm")) {
					this.prevMonth();
				} else if ($(cell).hasClass("tui-py")) {
					this.prevYear();
				} else if ($(cell).hasClass("tui-ny")) {
					this.nextYear();
				} else if ($(cell).hasClass("tui-nm")) {
					this.nextMonth();
				} else if (typeof cell["offsetMonth"] === "number") {
					var d = parseInt(cell.innerHTML, 10);
					var y = this.get("year"), m = this.get("month");
					var offset: number = cell["offsetMonth"];
					if (offset < 0) {
						if (m === 1) {
							y--;
							m = 12;
						} else {
							m--;
						}
						this.onPicked(y, m, d);
					} else if (offset > 0) {
						if (m === 12) {
							y++;
							m = 1;
						} else {
							m++;
						}
						this.onPicked(y, m, d);
					} else if (offset === 0) {
						this.onPicked(y, m, d);
					}
				}
			}).click( (e: JQueryEventObject) => {
				var cell = <any>(e.target || e.srcElement);
				if (cell.nodeName.toLowerCase() !== "td")
					return;
				if (typeof cell["offsetMonth"] === "number") 
					this.fire("click", {e:e, "time": this.get("time"), "type": "pick"});
				else if(/^(tui-pm|tui-py|tui-nm|tui-ny)$/.test(cell.className))
					this.fire("click", {e:e, "time": this.get("time"), "type": "change"});
			}).dblclick( (e: JQueryEventObject) => {
				var cell = <any>(e.target || e.srcElement);
				if (cell.nodeName.toLowerCase() !== "td")
					return;
				if (typeof cell["offsetMonth"] === "number")
					this.fire("dblclick", {e:e, "time": this.get("time")});
			});
			$(this._).keydown( (e) => {
				var k = e.keyCode;
				if ([13, 33, 34, 37, 38, 39, 40].indexOf(k) >= 0) {
					if (k === 37) {
						var tm = time.dateAdd(this.get("time"), -1);
						this.set("time", tm);
					} else if (k === 38) {
						var tm = time.dateAdd(this.get("time"), -7);
						this.set("time", tm);
					} else if (k === 39) {
						var tm = time.dateAdd(this.get("time"), 1);
						this.set("time", tm);
					} else if (k === 40) {
						var tm = time.dateAdd(this.get("time"), 7);
						this.set("time", tm);
					} else if (k === 33) {
						this.prevMonth();
					} else if (k === 34) {
						this.nextMonth();
					} else if (k === 13) {
						this.fire("click", {e:e, "time": this.get("time"), "type": "pick"});
					}
					return e.preventDefault();
				}
			});

		}
		
		private onPicked(y: number, m: number, d: number) {
			var oldTime = <Date>this.get("time");
			var newTime = new Date(y, m - 1, d, oldTime.getHours(), oldTime.getMinutes(), oldTime.getSeconds());
			this.set("time", newTime);
		}
		private makeTime(proc: (t: {y: number, m: number, d: number}) => void): void {
			var t = {y: this.get("year"), m: this.get("month"), d: this.get("day")}
			proc(t);
			var newDate = new Date(t.y, t.m - 1, 1);
			if (t.d > time.totalDaysOfMonth(newDate))
				t.d = time.totalDaysOfMonth(newDate);
			this.onPicked(t.y, t.m, t.d);
		}
		
		prevMonth() {
			this.makeTime(function(t: {y: number, m: number, d: number}){
				if (t.m === 1) {
					t.y--;
					t.m = 12;
				} else {
					t.m--;
				}
			});
		}
		nextMonth() {
			this.makeTime(function(t: {y: number, m: number, d: number}){
				if (t.m === 12) {
					t.y++;
					t.m = 1;
				} else {
					t.m++;
				}
			});
		}
		prevYear() {
			this.makeTime(function(t: {y: number, m: number, d: number}){
				t.y--;
			});
		}
		nextYear() {
			this.makeTime(function(t: {y: number, m: number, d: number}){
				t.y++;
			});
		}

		render() {
			function firstDay(date: Date): Date {
				var y = date.getFullYear();
				var m = date.getMonth();
				return new Date(y, m, 1);
			}
			var tb = <HTMLTableElement>this._components["table"];
			var tm = <Date>this.get("time");
			var today = time.now();
			var firstWeek = firstDay(tm).getDay();
			var daysOfMonth = time.totalDaysOfMonth(tm);
			var day = 0;
			(<HTMLTableRowElement>tb.rows[0]).cells[2].innerHTML = tm.getFullYear() + " - " + this.get("month");
			for (var i = 0; i < 6; i++) {
				for (var j = 0; j < 7; j++) {
					var cell: HTMLTableCellElement = <HTMLTableCellElement>(<HTMLTableRowElement>tb.rows[i + 2]).cells[j];
					cell.className = "";
					if (day === 0) {
						if (j === firstWeek) {
							day = 1;
							(<HTMLTableCellElement>cell).innerHTML = day + "";
							(<any>cell).offsetMonth = 0;
						} else {
							var preMonthDay = new Date(firstDay(tm).valueOf() - ((firstWeek - j) * 1000 * 24 * 60 * 60));
							(<HTMLTableCellElement>cell).innerHTML = preMonthDay.getDate() + "";
							(<any>cell).offsetMonth = -1;
							$(cell).addClass("tui-before");
						}
					} else {
						day++;
						if (day <= daysOfMonth) {
							cell.innerHTML = day + "";
							(<any>cell).offsetMonth = 0;
						} else {
							cell.innerHTML = (day - daysOfMonth) + "";
							(<any>cell).offsetMonth = 1;
							$(cell).addClass("tui-after");
						}
					}
					if (day === this.get("day"))
						$(cell).addClass("tui-actived");
					if (j === 0 || j === 6)
						$(cell).addClass("tui-weekend");
					if (this.get("year") === today.getFullYear() && this.get("month") === (today.getMonth() + 1) && day === today.getDate()) {
						$(cell).addClass("tui-today");
					}
				}
			}
			var timebar = <HTMLElement>this._components["timeBar"];
			if (this.get("timeBar")) {
				timebar.style.display = "";
				$(timebar).children("input[name=hours]").val(formatNumber(tm.getHours(), 23));
				$(timebar).children("input[name=minutes]").val(formatNumber(tm.getMinutes(), 59));
				$(timebar).children("input[name=seconds]").val(formatNumber(tm.getSeconds(), 59));
			} else {
				timebar.style.display = "none";
			}
		}

	}
	
	register(Calendar, "calendar");
}