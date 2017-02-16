this.use(function(btnMsg, btnInfo, btnOk, btnWarn, btnErr, btnAsk, btnWait){
	btnMsg.on("click", function(){
		tui.msgbox("一个普通测试消息。", "消息标题");
	});
	btnInfo.on("click", function(){
		tui.infobox("您还可以尝试使用不同的方法完成此操作。");
	});
	btnOk.on("click", function(){
		tui.okbox("保存操作成功！");
	});
	btnWarn.on("click", function(){
		tui.warnbox("股市有风险，请谨慎操作！");
	});
	btnErr.on("click", function(){
		tui.errbox("服务器没有响应！");
	});
	btnAsk.on("click", function(){
		tui.askbox("是否真的要删除该记录？");
	});
	btnWait.on("click", function(){
		var dlg = tui.waitbox("任务1请稍后...");
		setTimeout(function(){dlg.close()}, 3000);
		setTimeout(function(){
			var dlg1 = tui.waitbox("正在执行一个临时任务 2 请稍后, 这个描述有点长...");
			setTimeout(function(){
				dlg1.close();
				dlg1.close();
			},1000);
		},1000);
	});
});