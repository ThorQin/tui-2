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
		tui.inputbox([
			{
				"type": "textarea",
				"key": "code",
				"maxHeight": "300",
				"size": 6
			}
		], "代码", {"code": JSON.stringify(form.get("definition"), null, 2)}, function(value) {
			var code;
			try {
				code = JSON.parse(value.code);
			} catch (e) {
				tui.msgbox("无效的表单定义");
				return false;
			}
			form.set("definition", code);
		});
	});
});
