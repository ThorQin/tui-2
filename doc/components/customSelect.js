this.use(function(select, valueGroup){
	select.on("open", function(e){
		valueGroup.set("value", this.get("value"));
	});
	select.on("close", function(e){
		this.set("text", valueGroup.get("text"));
		this.set("value", valueGroup.get("value"));
	});
});