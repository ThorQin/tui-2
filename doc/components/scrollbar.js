this.use(function(scrollbar, info){
	scrollbar.on("scroll", function(e){
		info.innerHTML = e.data.value;
	});
});