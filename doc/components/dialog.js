this.use(function(btnMsg, btnInfo, btnOk, btnWarn, btnErr, btnAsk, btnWait, longMsg, longInfo){
	btnMsg.on("click", function(){
		tui.msgbox("一个普通测试消息。", "消息");
	});
	btnInfo.on("click", function(){
		tui.infobox("您还可以尝试使用不同的方法完成此操作。", "提示");
	});
	btnOk.on("click", function(){
		tui.okbox("保存操作成功！", "成功");
	});
	btnWarn.on("click", function(){
		tui.warnbox("股市有风险，请谨慎操作！", "警告");
	});
	btnErr.on("click", function(){
		tui.errbox("错误：服务器没有响应！", "错误");
	});
	btnAsk.on("click", function(){
		tui.askbox("是否真的要删除该记录？", "删除");
	});
	btnWait.on("click", function(){
		var dlg = tui.waitbox("任务1请稍后...");
		setTimeout(function(){dlg.close()}, 3000);
		setTimeout(function(){
			var dlg1 = tui.waitbox("正在执行一个临时任务2请稍后...");
			setTimeout(function(){
				dlg1.close();
				dlg1.close();
			},1000);
		},1000);
	});
	longMsg.on("click", function(){
		tui.msgbox("很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本", "删除");
	});
	longInfo.on("click", function(){
		tui.infobox("很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本很长很长的文本", "这是一个很长很长的标题这是一个很长很长的标题这是一个很长很长的标题这是一个很长很长的标题");
	});
});