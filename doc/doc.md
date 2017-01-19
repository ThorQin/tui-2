# 简介`(introduce)`
* TUI2 实现了不同于 *AngularJS*、*ReactJS* 以及 *Vue.js* 的模块化开发方式，
  TUI2 使用更自然的方式对页面和脚本进行模块化的组织，
  不需要使用脚本和标签混合的 JSX 语法，也不需要用 TypeScript 编译打包，使用方式完全回归传统。
  对于习惯使用 jQuery 这种命令式框架的开发人员来说更容易上手。
* NG 等框架只是一个开发框架，仅仅提供了模块化和模板等功能，
  而 TUI2 不仅关注代码的组织形式，还集成了常用的界面UI控件，和常用的脚手架代码，使得集成更为简单。
  且 TUI2 提供的界面控件**支持移动设备**。
* TUI2 使用 **组件**，**服务** 和 **扩展** 的概念来组织您的站点应用
 - **组件**：使用 *component* 标签封装的界面逻辑，可以使用独立的HTML界面描述文件和JS脚本控制器
 - **服务**：一组提前加载的单例对象，使用依赖式注入互相引用，同时也可以注入到**组件**中供组件逻辑使用
 - **扩展**：按照 TUI2 的规范，使用 TypeScript 或 Javascript 脚本开发的控件，如果内置的控件不能满足需要可以自行开发相应的控件
* TUI2 不使用 MVC，MVVM 等数据绑定方法，由于不使用数据绑定，所以也不使用虚拟DOM进行所谓的加速，
  内部控件的绘制就是直接操作DOM对象，而重绘仅仅发生在变动的对象上，不会造成浪费。
* 浏览器支持：**IE >= 8.0**，以及所有其他现代浏览器。

# 下载`(download)`
使用 npm 进行高安装：

```bash
npm install tui2
```
执行上述命令后，打开 `node_modules/tui2` 可以看到安装的文件。

# 使用`(quickStart)`
TUI2 依赖 Font Awesome、jQuery 以及 es5-shim.js (如果要兼容IE8)  
请在页面的 HEAD 标签中添加如下引用（或对应的压缩后版本）：
```html
<link rel="stylesheet" href="path/to/font-awesome.css">
<link rel="stylesheet" href="path/to/tui2.css" />
<script type="text/javascript" src="path/to/es5-shim.js"></script>
<script type="text/javascript" src="path/to/jquery-1.11.3.js"></script>
<script type="text/javascript" src="path/to/tui2.js"></script>
```

现在写一个 Hello World 页面：
```html
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="path/to/font-awesome.css">
<link rel="stylesheet" href="path/to/tui2.css" />
<script type="text/javascript" src="path/to/es5-shim.js"></script>
<script type="text/javascript" src="path/to/jquery-1.11.3.js"></script>
<script type="text/javascript" src="path/to/tui2.js"></script>
</head>
<body>
  <tui:component handler="main.js">
    <tui:button name="button">按我</tui:button>
  </tui:component>
</body>
</html>
```

然后写一个控制器脚本：
```javascript
// main.js
this.use(function(button){
  button.on("click", function(){
    tui.msgbox("Hello World!");
  });
});
```
这样就完成了一个基本的页面，TUI2推荐的代码组织形式是按照业务逻辑划分成可以复用的一个一个业务组件，
自顶向下按照组件的方式分割代码逻辑，形成良好的模块化开发方式。

下面开发一个业务组件，并在首页调用该组件：
```html
<!-- comp/mycomp.html -->
<tui:component handler="mycomp.js">
  <tui:input name="name"></tui:input>
  <tui:button name="submit">显示</tui:button>
</tui:component>
```

编写组件逻辑：

```javascript
// comp/mycomp.js
this.use(function(name, submit){
  submit.on("click", function(){
    tui.msgbox("您输入的是：" + name.get("value"));
  });
})
```

首页中引用组件：
```html
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="path/to/font-awesome.css">
<link rel="stylesheet" href="path/to/tui2.css" />
<script type="text/javascript" src="path/to/es5-shim.js"></script>
<script type="text/javascript" src="path/to/jquery-1.11.3.js"></script>
<script type="text/javascript" src="path/to/tui2.js"></script>
</head>
<body>
  <tui:component src="comp/mycomp.html"></tui:component>
</body>
</html>
```

# 控件
TUI2 提供了一组标准控件，取代了大部分浏览器内置的控件，以便提供统一的外观和操作。

TUI2 JS 中的命名空间使用 `tui`，而控件的命名空间是 `tui.widget`

所有控件继承自 `tui.widget.Widget`

* 对象公共方法：

方法 | 参数 | 描述
--- | --- | ---
get() | 属性名, 缺省值（可选） | 获取某属性
set() | 属性名, 新值 | 设置某属性
_set() | 属性名, 新值 | 设置某属性（不刷新控件）
refresh() | 无 | 如果 autoRefresh 为 true 则刷新控件（一般不用）
rander() | 无 | 绘制控件
appendTo() | parent, refresh（缺省是） | 把控件加入到某个DOM元素中
detach() | 无 | 从 DOM 树中分离
getComponent() | name | 获取子控件
getNodeName() | 无 | 获取控件的完整的 tagName
focus() | 无 | 获取焦点
on() | event（事件名称，多个用空格分开）, func（回调） | 绑定事件处理函数
once() | event（事件名称）, func（回调） | 绑定事件处理函数，只触发一次
off() |  event（事件名称） | 解绑处理函数

<br>
* 对象公共属性

属性 | 描述
--- | ---
id | 唯一标识
parent | 父控件（常用于组中的控件确定所属组）
disable | 禁用（不再接受用户操作）
group | 所属组名（可以使得无父组控件隶属于一个组）
tooltip | 鼠标提示
follow-tooltip | 鼠标跟随提示

<br>
* 常用静态公共方法：

方法 | 快捷方式 | 参数 | 描述
--- | --- | --- | ---
tui.widget.get() | $$() | id | 根据ID获取控件
tui.widget.create() | $new() | type（控件类型，如：button）, initParam（可选） | 创建新的控件实例
tui.widget.init() | 无 | parent（起始元素）, initFunc（可选） | 初始化元素及其所有子元素，已经初始化则刷新
tui.widget.search() | 无 | searchArea（可选）, filter（可选） | 可以按过滤条件递归查找控件



## [](fa-th-large) 按钮`(button)`
外观：
<tui:button>普通按钮</tui:button>
 <tui:button class="tui-primary"><i class="fa fa-warning"></i>&nbsp;重要</tui:button>
 <tui:button class="tui-danger">危险</tui:button>
 <tui:button class="tui-warning">警告</tui:button>
 <tui:button class="tui-success">成功</tui:button>
 <tui:button disable="{true}" >禁用</tui:button>
 <tui:button-group>
 <tui:button>菜单</tui:button><tui:button class="tui-dropdown"></tui:button>
 </tui:button-group>

使用标签创建：
```html
<tui:button class="tui-primary">重要</tui:button>
```

使用脚本创建：
```javascript
var button = $new("button");
button.appendTo(document.body);
```

按钮样式：

类名 | 描述
--- | ---
tui-primary | 重要
tui-danger | 危险
tui-warning | 警告
tui-success | 成功
tui-dropdown | 下拉菜单

事件：

事件名称 | 描述
--- | ---
click | 按钮点击
mousedown | 鼠标按下
mouseup | 鼠标释放
keydown | 键盘按下
keyup | 键盘释放

属性：

属性名 | 描述
--- | ---
value | 值（用来提交表单）
text | 按钮文字
type | 按钮类型：toggle 、radio 或 toggle-radio（可取消选择的单选）
checked | 是否选择
tristate | 是否是中间状态

例子：
```html
<tui:button id="myButton" class="tui-primary">重要</tui:button>
<script>
$$("myButton").on("click", function(){
	tui.msgbox("按钮按下！");
});
</script>
```

## [](fa-check-square-o) 单选`(radio)`
外观：
<tui:group>
 <tui:radio>选项1</tui:radio>
 <tui:radio>选项2</tui:radio>
 <tui:radio>选项3</tui:radio>
 </tui:group>

使用标签创建：
```html
<tui:group>
  <tui:radio>选项1</tui:radio>
  <tui:radio>选项2</tui:radio>
  <tui:radio>选项3</tui:radio>
</tui:group>
```

使用脚本创建：
```javascript
var radio = $new("radio");
radio.appendTo(document.body);
```

属性、事件、方法和 `button` 完全一致。

## [](fa-dot-circle-o) 多选`(check)`

外观：
<tui:group>
 <tui:check>选项1</tui:check>
 <tui:check>选项2</tui:check>
 <tui:check>选项3</tui:check>
 </tui:group>

使用标签创建：
```html
<tui:group>
  <tui:check>选项1</tui:check>
  <tui:check>选项2</tui:check>
  <tui:check>选项3</tui:check>
</tui:group>
```

使用脚本创建：
```javascript
var check = $new("check");
check.appendTo(document.body);
```

属性、事件、方法和 `button` 完全一致。

## [](fa-columns) 页签`(tab)`

外观：
<tui:button-group class="tui-tab" style="border-bottom:1px solid #ccc">
  <tui:radio checked={true}>页签1</tui:radio>
  <tui:radio>页签2</tui:radio>
  <tui:radio>页签3</tui:radio>
  <tui:radio>页签4</tui:radio>
  <tui:radio>页签5</tui:radio>
  </tui:button-group>

使用标签创建：
```html
<tui:button-group class="tui-tab" style="border-bottom:1px solid #ccc">
  <tui:radio checked={true}>页签1</tui:radio>
  <tui:radio>页签2</tui:radio>
  <tui:radio>页签3</tui:radio>
  <tui:radio>页签4</tui:radio>
  <tui:radio>页签5</tui:radio>
</tui:button-group>
```
可以看到页签其实就是一组 radio 控件，只是外观有所变化。


## [](fa-th) 按钮组`(group)`

外观：
<tui:button-group>
			<tui:button><i class="fa fa-file-o"></i></tui:button>
			<tui:button><i class="fa fa-save"></i></tui:button>
		</tui:button-group>
		<tui:button-group>
			<tui:button><i class="fa fa-copy"></i></tui:button>
			<tui:button><i class="fa fa-cut"></i></tui:button>
			<tui:button><i class="fa fa-paste"></i></tui:button>
		</tui:button-group>
		<tui:button-group type="toggle-radio">
			<tui:button><i class="fa fa-align-left"></i></tui:button>
			<tui:button><i class="fa fa-align-justify"></i></tui:button>
			<tui:button><i class="fa fa-align-right"></i></tui:button>	
		</tui:button-group>
    <tui:button-group>
      <tui:button><i class="fa fa-font"></i></tui:button>
			<tui:button disable="{true}" ><i class="fa fa-pencil"></i></tui:button>
    </tui:button-group>
  
HTML代码：
```html
<tui:button-group>
  <tui:button><i class="fa fa-file-o"></i></tui:button>
  <tui:button><i class="fa fa-save"></i></tui:button>
</tui:button-group>
<tui:button-group>
  <tui:button><i class="fa fa-copy"></i></tui:button>
  <tui:button><i class="fa fa-cut"></i></tui:button>
  <tui:button><i class="fa fa-paste"></i></tui:button>
</tui:button-group>
<tui:button-group type="toggle-radio">
  <tui:button><i class="fa fa-align-left"></i></tui:button>
  <tui:button><i class="fa fa-align-justify"></i></tui:button>
  <tui:button><i class="fa fa-align-right"></i></tui:button>	
</tui:button-group>
<tui:button-group>
  <tui:button><i class="fa fa-font"></i></tui:button>
  <tui:button disable="{true}" ><i class="fa fa-pencil"></i></tui:button>
</tui:button-group>
```

## [](fa-i-cursor) 输入框`(input)`
外观：
<tui:input placeholder="普通输入框"></tui:input>
<tui:input placeholder="左侧有图标" icon-left="fa-search"></tui:input>
<tui:input placeholder="右侧有图标" icon-right="fa-search"></tui:input>
<tui:input placeholder="可以清除的输入框" clearable={true}></tui:input>
<tui:input placeholder="可以清除的输入框" icon-right="fa-search" clearable={true}></tui:input>
<tui:input placeholder="验证邮箱" icon-left="fa-envelope-o" auto-validate={true}>
 <tui:verify format="*email">请输入合法的邮箱</tui:verify>
 </tui:input>

HTML代码：
```html
<tui:input placeholder="普通输入框"></tui:input>
<tui:input placeholder="左侧有图标" icon-left="fa-search"></tui:input>
<tui:input placeholder="右侧有图标" icon-right="fa-search"></tui:input>
<tui:input placeholder="可以清除的输入框" clearable={true}></tui:input>
<tui:input placeholder="可以清除的输入框" icon-right="fa-search" clearable={true}></tui:input>
<tui:input placeholder="验证邮箱" icon-left="fa-envelope-o" auto-validate={true}>
  <tui:verify format="*email">请输入合法的邮箱</tui:verify>
</tui:input>
```
输入框的验证使用标签定义： `<tui:verify format="格式定义">提示文字</tui:verify>`  
可以定义多个验证规则，以 * 开头的规则是预定义规则，否则是一个正则表达式。

事件：

事件名称 | 描述
--- | ---
input | 输入事件
change | 内容改变事件
left-icon-mousedown | 鼠标按下在左侧图标
right-icon-mousedown | 鼠标按下在右侧图标
left-icon-click | 鼠标点击在左侧图标
right-icon-click | 鼠标点击在右侧图标

属性：

属性名 | 描述
--- | ---
value | 值（用来提交表单）
text | 输入文字
type | 输入框类型：text, password, email, url, number
iconLeft | 左侧图标
iconRight | 右侧图标
validate | 定义验证规则，通过属性定义需要传递 JSON 格式的对象，也可以通过 tui:verify 子标签定义
autoValidate | 是否自动验证

预定义验证规则：

规则 | 描述
--- | ---
*email | 验证是否是合法邮箱
*chinese | 验证是否是中文
*url | 验证是否是URL地址
*digital | 验证是否是纯数字
*integer | 验证是否是整数（可以是负数）
*float | 验证是否是浮点数
*number | 验证是否是整数或浮点数
*currency | 验证是否是财务数字（每3位用逗号隔开，小数点后最多3位）
*date | 验证是否是日期格式
*key | 验证是否符合命名规则（和C语言标识符的规则一致）
*any | 验证是否输入了任何内容（纯空格不算）

## [](fa-edit) 多行输入`(text)`

外观：
<tui:textarea placeholder="多行文字输入" ></tui:textarea>
<tui:textarea placeholder="可以验证格式" auto-validate={true} >
  <tui:verify format="*any">请随便输入一些内容</tui:verify>
  </tui:textarea>

HTML代码：
```html
<tui:textarea placeholder="多行文字输入" ></tui:textarea>
<tui:textarea placeholder="可以验证格式" auto-validate={true} >
  <tui:verify format="*any">请随便输入一些内容</tui:verify>
</tui:textarea>
```
事件和属性参考单行输入框，不支持左右图标和清除内容，其它一致。

## [](fa-toggle-down) 下拉单选`(select)`

外观：
<tui:select placeholder="普通单选" tree="{[
  {name:'选项1', value:'v1'},
  {name:'选项2', value:'v2'},
  {name:'选项3', value:'v3', children:[
    {name:'子选项3-1', value:'v4'},
    {name:'子选项3-2', value:'v5'}
  ]}
  ]}" auto-validate={true}>
    <tui:verify format="*any">随便选择一个条目</tui:verify>
  </tui:select>

<tui:select placeholder="可清除的单选" tree="{[
  {name:'选项1', value:'v1'},
  {name:'选项2', value:'v2'},
  {name:'选项3', value:'v3', children:[
    {name:'子选项3-1', value:'v4'},
    {name:'子选项3-2', value:'v5'}
  ]}
  ]}" auto-validate={true} clearable={true}  can-search={true}>
    <tui:verify format="*any">随便选择一个条目</tui:verify>
  </tui:select>

可以看到，选择框支持嵌套的树状数据，还支持本地搜索。

HTML代码：
```html
<tui:select tree="{[
  {name:'选项1', value:'v1'},
  {name:'选项2', value:'v2'},
  {name:'选项3', value:'v3', children:[
    {name:'子选项3-1', value:'v4'},
    {name:'子选项3-2', value:'v5'}
  ]}
]}" auto-validate={true} can-search={true}>
  <tui:verify format="*any">随便选择一个条目</tui:verify>
</tui:select>
```
事件名称 | 描述
--- | ---
change | 内容选择事件
click | 点击选择项事件

属性：

属性名 | 描述
--- | ---
value | 值（用来提交表单）
text | 选择的文字
data | 数据内容，需要传递 tui.ds.DS 对象，如果不是 DS 对象则认为是数组，可以是远程数据源
list | 数组或列表，非树状结构数据
tree | 树状结构数据
multiSelect | 是否多选
checkKey | 多选时的选择键
nameKey | 数据条目中的显示字段
valueKey | 数据条目中的值字段
iconKey | 数据条目中的图标字段
canSearch | 是否支持搜索
search | 搜索内容
validate | 定义验证规则，通过属性定义需要传递 JSON 格式的对象，也可以通过 tui:verify 子标签定义
autoValidate | 是否自动验证

选择框的验证语法和输入框相同。

## [](fa-toggle-down) 下拉多选`(multiSelect)`
外观：
<tui:select tree="{[
  {name:'选项1', value:'v1' ,check: false},
  {name:'选项2', value:'v2' ,check: false},
  {name:'选项3', value:'v3' ,check: false, children:[
    {name:'子选项3-1', value:'v4' ,check: false},
    {name:'子选项3-2', value:'v5', check: false}
  ]}
 ]}" auto-validate={true} multi-select={true} can-search={true}>
  <tui:verify format="*any">随便选择一个条目</tui:verify>
 </tui:select>

多选和单选的标签是一样的，只是设置 `multiSelect` 属性为 `true`。

属性和事件请参考下拉单选控件。

## [](fa-toggle-down) 自定义选择`(customSelect)`
外观：
<tui:component src="components/customSelect.html"></tui:component>

## [](fa-file) 文件选择`(file)`
外观：
<tui:file placeholder="请选择文件..." accept="text/plain" 
 clearable={true}  action="uploadFile.do"></tui:file>

## [](fa-calendar-o) 日期选择`(datePicker)`
外观：
<tui:date-picker placeholder="选择日期"></tui:date-picker>

<tui:date-picker placeholder="选择日期和时间" format="yyyy-MM-dd hh:mm:ss" time-bar={true}></tui:date-picker>

## [](fa-calendar) 日历`(calendar)`
外观：
<tui:calendar time-bar="{true}"></tui:calendar>

## [](fa-clone) 弹出层`(popup)`
外观：
<tui:component src="components/popup.html"></tui:component>

## [](fa-bars) 弹出菜单`(menu)`
外观：
<tui:component src="components/menu.html"></tui:component>

## [](fa-commenting) 对话框`(dialog)`
外观：
<tui:component src="components/dialog.html"></tui:component>

## [](fa-sliders) 滚动条`(scrollbar)`
外观：
<tui:component src="components/scrollbar.html"></tui:component>

## [](fa-table) 数据网格`(grid)`
外观：
<tui:component src="components/grid.html"></tui:component>

## [](fa-th-list) 数据列表`(list)`
外观：
<tui:list style="height:200px;width:300px;margin:20px" 
			checkable={true} row-tooltip-key="desc" data="{[
				{name: '列表内容1(不可选)', value: 'value1', desc: '这是一个很长的描述信息1'},
				{name: '列表内容2', check:false,  value: 'value2', desc: '这是一个很长的描述信息2'},
				{name: '列表内容3', check:false, value: 'value3', desc: '这是一个很长的描述信息3'},
				{name: '列表内容4', check:true, value: 'value4', desc: '这是一个很长的描述信息4'},
				{name: '列表内容5', check:false, value: 'value5', desc: '这是一个很长的描述信息5'},
				{name: '列表内容6(不可选)', value: 'value6', desc: '这是一个很长的描述信息6'}
			]}">
		</tui:list>
		<tui:list style="height:200px;width:300px;margin:20px" 
			data="{[
				{name: '列表内容1'},
				{name: '列表内容2'},
				{name: '列表内容3'},
				{name: '列表内容4'},
				{name: '列表内容5'},
				{name: '列表内容6'}
			]}">
		</tui:list>

## [](fa-object-ungroup) 组件化开发`(component)`

## [](fa-window-maximize) 嵌入页`(frame)`

# 工具函数
## [](fa-sitemap) 路由`(router)`
```javascript
// 在首页的开始就注册路由表，然后在处理函数中使用 tui:frame 进行页面跳转
tui.browser.startRouter([
  {
    state: "/test",
    url: "page2.html"
  }, {
    state: "/index",
    url: "page1.html",
    default: true
  }
], function(state, hash, url){
  $$("rootContainer").go(url);
});
```

## [](fa-clock-o) 时间`(time)`

## [](fa-file-text-o) 字符串`(string)`

## [](fa-sitemap) 浏览器相关`(browser)`

## [](fa-language) 多语言`(lang)`


