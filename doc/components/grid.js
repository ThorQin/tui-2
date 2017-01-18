this.use(function(grid){
	grid.set("columns", [
		{name: "name column", key: "name", sortable: true, 
			arrow: true, checkKey: "checked", iconKey: "icon"}, 
		{name: "value column", key: "value"},
		{name: "value column", key: "value"}
	]);
	var data = [];
	for (var i = 0; i < 10; i++) {
		var item = {
			name: "列" + i,
			value: "值" + i,
			children: []
		};
		for (var j = 0; j < 5; j++) {
			item.children.push({
				name: "列" + i + "_" + j,
				value: "值" + i + "_" + j
			});
		}
		data.push(item)
	}
	
	grid.set("tree", data);
});