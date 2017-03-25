this.use(function(mode, submit, define, form) {
	mode.on("click", function(e){
		form.set("mode", this.get("value"));
	});
	submit.on("click", function(e){
		if (form.validate())
			tui.msgbox(JSON.stringify(form.get("value")));
		else
			tui.errbox("输入内容有误，请检查表单！");
	});
	define.on("click", function(e) {
		tui.msgbox(JSON.stringify(form.get("definition")));
	});
});
