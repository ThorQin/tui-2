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

	function firstDay(date: Date): Date {
		var y = date.getFullYear();
		var m = date.getMonth();
		return new Date(y, m, 1);
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
						var tm = this._data["time"] as Date;
						if (typeof tm === UNDEFINED || tm === null) {
							tm = time.now();
							tm.setHours(0);
							tm.setMinutes(0);
							tm.setSeconds(0);
							tm.setMilliseconds(0);
							this._data["time"] = tm;
						}
						return tm;
					}
				},
				"value": {
					"set": (value: any): void => {
						this._set("time", value);
					},
					"get": (): any => {
						var tm = this.get("time");
						var md = this.get("mode");
						var tz = this.get("timezone");
						var fmt;
						if (md === "date") {
							fmt = "yyyy-MM-dd";
							if (tz === "utc")
								fmt += "Z";
							else if (tz === "locale")
								fmt += "Zzzz";
						} else if (md === "month") {
							fmt = "yyyy-MM";
							if (tz === "utc")
								fmt += "Z";
							else if (tz === "locale")
								fmt += "Zzzz";
						} else if (md === "time") {
							fmt = "HH:mm:ss";
						} else {
							fmt = "yyyy-MM-ddTHH:mm:ss";
							if (tz === "utc")
								fmt += "Z";
							else if (tz === "locale")
								fmt += "zzz";
							else
								fmt = "yyyy-MM-dd HH:mm:ss";
						}
						return time.formatDate(tm, fmt);
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
				},
				"mode": {
					"set": (value: any): void => {
						if (["date", "date-time", "month", "time"].indexOf(value) >= 0 )
							this._data["mode"] = value;
					},
					"get": (): any => {
						return this._data["mode"] ? this._data["mode"] : "date";
					}
				},
				"timezone": {
					"set": (value: any): void => {
						if (["utc", "locale", "none"].indexOf(value) >= 0 )
							this._data["timezone"] = value;
					},
					"get": (): any => {
						return this._data["timezone"] ? this._data["timezone"] : "none";
					}
				}
			});
		}

		private _monthOnly: boolean;
		protected makeTable() {
			var monthOnly = (this.get("mode") === "month");
			if (this._monthOnly === monthOnly)
				return;

			var tb = <HTMLTableElement>this._components["table"]
			while(tb.children.length > 0)
				tb.removeChild(tb.firstChild);
			if (monthOnly) {
				var bar = <HTMLTableRowElement>tb.insertRow(-1);
				bar.className = "tui-yearbar";
				bar.insertCell(-1).className = "tui-py";
				var ym = bar.insertCell(-1);
				ym.className = "tui-ym";
				ym.setAttribute("colSpan", "2");
				bar.insertCell(-1).className = "tui-ny";
				for (let i = 0; i < 3; i++) {
					var line = <HTMLTableRowElement>tb.insertRow(-1);
					for (let j = 0; j < 4; j++) {
						let cell = <HTMLTableCellElement>line.insertCell(-1);
						cell.className = "tui-month";
						let m = i * 4 + j;
						cell.innerHTML = tui.str(time.shortMonths[m]);
						cell.setAttribute("month", m + 1 + "");
					}
				}
			} else {
				var bar = <HTMLTableRowElement>tb.insertRow(-1);
				bar.className = "tui-yearbar";
				bar.insertCell(-1).className = "tui-pm";
				bar.insertCell(-1).className = "tui-py";
				var ym = bar.insertCell(-1);
				ym.className = "tui-ym";
				ym.setAttribute("colSpan", "3");
				bar.insertCell(-1).className = "tui-ny";
				bar.insertCell(-1).className = "tui-nm";
				for (var i = 0; i < 7; i++) {
					var line = <HTMLTableRowElement>tb.insertRow(-1);
					for (var j = 0; j < 7; j++) {
						var cell = <HTMLTableCellElement>line.insertCell(-1);
						if (j === 0 || j === 6)
							cell.className = "tui-week-end";
						if (i === 0) {
							cell.className = "tui-week";
							cell.innerHTML = tui.str(time.shortWeeks[j]);
						}
					}
				}
			}
			this._monthOnly = monthOnly;
		}

		protected init(): void {
			$(this._).attr({ "tabIndex": "0", "unselectable": "on"});
			var tb = this._components["table"] = <HTMLTableElement>browser.toElement(
				"<table cellPadding='0' cellspacing='0' border='0'></table>");
			this._.appendChild(tb);
			this._monthOnly = null;

			var timebar = this._components["timeBar"] = <HTMLTableElement>browser.toElement(
`<div class="tui-calendar-timebar" unselectable='on'>
<div><span name='hours-plus' class='plus' tabIndex='0' ></span>
<input name='hours' maxLength='2'>
<span name='hours-minus' class='minus' tabIndex='0'></span>
</div> : <div><span name='minutes-plus' class='plus' tabIndex='0'></span>
<input name='minutes' maxLength='2'>
<span name='minutes-minus' class='minus' tabIndex='0'></span>
</div> : <div><span name='seconds-plus' class='plus' tabIndex='0'></span>
<input name='seconds' maxLength='2'>
<span name='seconds-minus' class='minus' tabIndex='0'></span></div>
<a class='tui-update'></a></div>`);
			this._.appendChild(timebar);

			function getMaxValue(name: string): number {
				if (name === "hours")
					return 23;
				else
					return 59;
			}

			var getInputTime = () => {
				function getInput(index:number): any {
					return $(timebar).find("input")[index];
				}
				var tm = <Date>this.get("time");
				tm.setHours(parseInt(getInput(0).value));
				tm.setMinutes(parseInt(getInput(1).value));
				tm.setSeconds(parseInt(getInput(2).value));
				this.set("time", tm);
			};

			function plus(o$: JQuery, input: HTMLInputElement) {
				let max = getMaxValue(o$.attr("name"));
				let v = parseInt(input.value) + 1;
				if (v > max) v = 0;
				input.value = formatNumber(v, max);
				getInputTime();
			}

			function minus(o$: JQuery, input: HTMLInputElement) {
				let max = getMaxValue(o$.attr("name"));
				let v = parseInt(input.value) - 1;
				if (v < 0) v = max;
				input.value = formatNumber(v, max);
				getInputTime();
			}

			var timebar$ = $(timebar);
			timebar$.keydown((e) => {
				if (this.get("disable"))
					return false;
				var o = <any>(e.srcElement || e.target);
				var o$ = $(o);
				var k = e.keyCode;
				if (o.nodeName.toUpperCase() === "INPUT") {
					if (k === browser.KeyCode.TAB)
						return;
					e.preventDefault();
					e.stopPropagation();
					var input = <HTMLInputElement>o;
					if (k === browser.KeyCode.LEFT) {
						if (o$.attr("name") === "seconds")
							timebar$.find("input[name=minutes]").focus();
						else if (o$.attr("name") === "minutes")
							timebar$.find("input[name=hours]").focus();
					} else if (k === browser.KeyCode.RIGHT) {
						if (o$.attr("name") === "hours")
							timebar$.find("input[name=minutes]").focus();
						else if (o$.attr("name") === "minutes")
							timebar$.find("input[name=seconds]").focus();
					} else if (k === browser.KeyCode.UP) {
						plus(o$, input);
						input.select();
					} else if (k === browser.KeyCode.DOWN) {
						minus(o$, input);
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

			timebar$.on("mousedown", (e) => {
				if (this.get("disable"))
					return false;
				var o = <any>(e.srcElement || e.target);
				if (o.nodeName.toLowerCase() === "span") {
					var name = o.getAttribute("name");
					var arr = name.split("-");
					var o$ = timebar$.find("input[name=" + arr[0] + "]");
					var input = <HTMLInputElement>o$[0];
					var timer: number = null;
					var beginner: number = null;
					if (arr[1] == "plus") {
						plus(o$, input);
						beginner = setTimeout(function(){
							timer = setInterval(function(){
								plus(o$, input);
							}, 100);
						}, 500);
						openDragMask(null, function(){
							clearTimeout(beginner);
							clearInterval(timer);
						});
					} else {
						minus(o$, input);
						beginner = setTimeout(function(){
							timer = setInterval(function(){
								minus(o$, input);
							}, 100);
						}, 500);
						openDragMask(null, function(){
							clearTimeout(beginner);
							clearInterval(timer);
						});
					}
				}
			});

			timebar$.find("input").on("focus mousedown mouseup", function(e){
				var o = <any>(e.srcElement || e.target);
				o.focus();
				o.select();
				e.preventDefault();
				setTimeout(function (){
					o.select();
				});
			}).on("contextmenu", function(e){e.preventDefault();});
			timebar$.children("a").mousedown((e) => {
				if (this.get("disable"))
					return false;
				let now = time.now();
				let newTime = new Date(this.get("year"), this.get("month") - 1, this.get("day"),
					now.getHours(), now.getMinutes(), now.getSeconds());
				this.set("time", newTime);
				setTimeout(() => { this._.focus(); });
				e.stopPropagation();
				return false;
			}).click((e) => {
				if (this.get("disable"))
					return false;
				this.fire("click", {e:e, "time": this.get("time"), "type": "refresh"});
			});

			$(tb).mousedown((e) => {
				if (this.get("disable"))
					return false;
				if (tui.ffVer > 0) {
					setTimeout(() => { this._.focus(); });
				}
				var cell = <HTMLElement>(e.target || e.srcElement);
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
				} else if (typeof (<any>cell)["offsetMonth"] === "number") {
					let d = parseInt(cell.innerHTML, 10);
					let y = this.get("year"), m = this.get("month");
					let offset: number = (<any>cell)["offsetMonth"];
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
				} else if (cell.hasAttribute("month")) {
					let y = this.get("year");
					let m = parseInt(cell.getAttribute("month"));
					this.onPicked(y, m, 1);
				}
			}).click( (e: JQueryEventObject) => {
				if (this.get("disable"))
					return false;
				var cell = <any>(e.target || e.srcElement);
				if (cell.nodeName.toLowerCase() !== "td")
					return;
				if (typeof cell["offsetMonth"] === "number" || cell.hasAttribute("month"))
					this.fire("click", {e:e, "time": this.get("time"), "type": "pick"});
				else if(/^(tui-pm|tui-py|tui-nm|tui-ny)$/.test(cell.className))
					this.fire("click", {e:e, "time": this.get("time"), "type": "change"});
			}).dblclick( (e: JQueryEventObject) => {
				if (this.get("disable"))
					return false;
				var cell = <any>(e.target || e.srcElement);
				if (cell.nodeName.toLowerCase() !== "td")
					return;
				if (typeof cell["offsetMonth"] === "number" || cell.hasAttribute("month"))
					this.fire("dblclick", {e:e, "time": this.get("time")});
			});
			$(this._).keydown( (e) => {
				if (this.get("disable"))
					return false;
				var k = e.keyCode;
				var tm: Date;
				if ([13, 33, 34, 37, 38, 39, 40].indexOf(k) >= 0) {
					if (k === 37) { // LEFT
						if (this._monthOnly) {
							tm = time.dateAdd(this.get("time"), -1, "M");
						} else {
							tm = time.dateAdd(this.get("time"), -1);
						}
						this.set("time", tm);
						this.fire("change", {"time": this.get("time")})
					} else if (k === 38) { // UP
						if (this._monthOnly) {
							tm = time.dateAdd(this.get("time"), -4, "M");
						} else {
							var tm = time.dateAdd(this.get("time"), -7);
						}
						this.set("time", tm);
						this.fire("change", {"time": this.get("time")})
					} else if (k === 39) { // RIGHT
						if (this._monthOnly) {
							tm = time.dateAdd(this.get("time"), 1, "M");
						} else {
							tm = time.dateAdd(this.get("time"), 1);
						}
						this.set("time", tm);
						this.fire("change", {"time": this.get("time")})
					} else if (k === 40) { // DOWN
						if (this._monthOnly) {
							tm = time.dateAdd(this.get("time"), 4, "M");
						} else {
							tm = time.dateAdd(this.get("time"), 7);
						}
						this.set("time", tm);
						this.fire("change", {"time": this.get("time")})
					} else if (k === 33) { // PRIOR PAGE_UP
						if (this._monthOnly) {
							tm = time.dateAdd(this.get("time"), -1, "y");
						} else {
							tm = time.dateAdd(this.get("time"), -1, "M");
						}
						this.set("time", tm);
						this.fire("change", {"time": this.get("time")})
					} else if (k === 34) { // NEXT PAGE_DOWN
						if (this._monthOnly) {
							tm = time.dateAdd(this.get("time"), 1, "y");
						} else {
							tm = time.dateAdd(this.get("time"), 1, "M");
						}
						this.set("time", tm);
						this.fire("change", {"time": this.get("time")})
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
			this.fire("change", {"time": this.get("time")})
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
			this.makeTable();
			var tb = <HTMLTableElement>this._components["table"];
			var tm = <Date>this.get("time");
			var today = time.now();
			var mode = this.get("mode");
			if (mode !== "time") {
				if (this._monthOnly) {
					(<HTMLTableRowElement>tb.rows[0]).cells[1].innerHTML = tm.getFullYear() + " - " + this.get("month");
					for (var i = 0; i < 3; i++) {
						for (var j = 0; j < 4; j++) {
							let cell = <HTMLElement>(<HTMLTableRowElement>tb.rows[i + 1]).cells[j];
							let m = i * 4 + j + 1;
							if (m == this.get("month")) {
								browser.addClass(cell, "tui-actived");
							} else {
								browser.removeClass(cell, "tui-actived");
							}
						}
					}
				} else {
					var firstWeek = firstDay(tm).getDay();
					var daysOfMonth = time.totalDaysOfMonth(tm);
					var day = 0;
					(<HTMLTableRowElement>tb.rows[0]).cells[2].innerHTML = tm.getFullYear() + " - " + this.get("month");
					for (let i = 0; i < 6; i++) {
						for (let j = 0; j < 7; j++) {
							let cell: HTMLTableCellElement = <HTMLTableCellElement>(<HTMLTableRowElement>tb.rows[i + 2]).cells[j];
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
				}
				tb.style.display = "";
			} else {
				tb.style.display = "none";
			}
			var timebar = <HTMLElement>this._components["timeBar"];
			if (mode === "date-time" || mode === "time") {
				timebar.style.display = "";
				$(timebar).find("input[name=hours]").val(formatNumber(tm.getHours(), 23));
				$(timebar).find("input[name=minutes]").val(formatNumber(tm.getMinutes(), 59));
				$(timebar).find("input[name=seconds]").val(formatNumber(tm.getSeconds(), 59));
			} else {
				timebar.style.display = "none";
			}
		}
	}

	register(Calendar, "calendar");
}
