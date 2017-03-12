this.use(function(mode, submit, form) {
	mode.on("click", function(e){
		form.set("mode", this.get("value"));
	});
	submit.on("click", function(e){
		tui.msgbox(JSON.stringify(form.get("value")));
	});
});