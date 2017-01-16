this.use(function(grid){
	grid.set("columns", [
		{name: "name column", key: "name", sortable: true, 
			arrow: true, checkKey: "checked", iconKey: "icon"}, 
		{name: "value column", key: "value"},
		{name: "value column", key: "value"}
	]);
	var data = [];
	for (var i = 0; i < 1000; i++) {
		data.push({
			name: "列" + i,
			value: "值" + i
		})
	}
	grid.set("list", data);
});