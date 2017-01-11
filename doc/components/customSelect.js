this.use(function(select, content){
	select.on("popup", function(e){
		e.data.setContent(content);
		e.data.open("ok#tui-primary");
	});

});