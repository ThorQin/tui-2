# 简介`(introduce)`
* TUI2 实现了不同于 *AngularJS*、*ReactJS* 的模块化开发方式，
  TUI2 使用更自然的方式对页面和脚本进行模块化的组织，
  不需要使用脚本和标签混合的 JSX 语法，也不需要用 TypeScript 编译打包，使用方式完全回归传统。
  对于习惯使用 jQuery 这种命令式框架的开发人员来说更容易上手，简单而高效。
* NG 等框架只是一个开发框架，仅仅提供了模块化和模板等功能，
  而 TUI2 除了关注代码的组织形式，它更侧重于为界面提供一组标准的控件和常用的脚手架代码，使得集成更为简单。
  且 TUI2 提供的界面控件完全**支持移动设备**。
* TUI2 使用 **组件**，**服务** 和 **插件** 的概念来组织您的站点应用
 - **组件**：使用 *component* 标签封装的可复用的业务逻辑，可以使用独立的HTML界面描述文件和JS脚本控制器
 - **服务**：一组提前加载的单例对象，使用依赖式注入互相引用，同时也可以注入到**组件**中供组件逻辑使用
 - **插件**：按照 TUI2 的规范，使用 TypeScript 或 Javascript 脚本开发的控件，如果内置的控件不能满足需要可以自行开发相应的控件
* TUI2 不使用 MVC，MVVM 等数据绑定方法，由于不使用数据绑定，所以也不使用虚拟DOM进行所谓的加速，
  内部控件的绘制就是直接操作DOM对象，而重绘仅仅发生在变动的对象上，不会造成浪费。
* 浏览器支持：**IE >= 8.0**，以及所有其他现代浏览器。

# 反馈`(author)`

本框架作者是：秦诺，如要反馈问题，可以发邮件到 [thor.qin@outlook.com](mailto:thor.qin@outlook.com)
或 [thor.qin@qq.com](mailto:thor.qin@qq.com) 或提交 issue 到：[问题列表](https://git.oschina.net/thor.qin/TUI-2/issues)

# 下载`(download)`
使用 npm 进行安装，当前最新版本 **<span id="docVersion"></span>**：

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
<!--[if IE 8]>
<script type="text/javascript" src="path/to/es5-shim.js"></script>
<script type="text/javascript" src="path/to/json2.js"></script>
<![endif]-->
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

关于模块化开发、SPA 应用的内容，请参考关于 <a href="#component">模块化开发</a>，<a href="#frame">嵌入页</a> 和 <a href="#router">路由</a> 的描述。

# 基本控件
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

<tui:button class="tui-flat">普通平面按钮</tui:button>
 <tui:button class="tui-primary tui-flat"><i class="fa fa-warning"></i>&nbsp;重要</tui:button>
 <tui:button class="tui-danger tui-flat">危险</tui:button>
 <tui:button class="tui-warning tui-flat">警告</tui:button>
 <tui:button class="tui-success tui-flat">成功</tui:button>
 <tui:button disable="{true}" class="tui-flat" >禁用</tui:button>

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
tui-flat | 平面按钮

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
<div style="border-bottom:1px solid #ddd">
  <tui:button-group class="tui-tab">
  <tui:radio checked={true}>页签1</tui:radio>
  <tui:radio>页签2</tui:radio>
  <tui:radio>页签3</tui:radio>
  <tui:radio>页签4</tui:radio>
  <tui:radio>页签5</tui:radio>
  </tui:button-group>
  </div>

使用标签创建：
```html
<div style="border-bottom:1px solid #ddd">
  <tui:button-group class="tui-tab">
    <tui:radio checked={true}>页签1</tui:radio>
    <tui:radio>页签2</tui:radio>
    <tui:radio>页签3</tui:radio>
    <tui:radio>页签4</tui:radio>
    <tui:radio>页签5</tui:radio>
  </tui:button-group>
</div>
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
<tui:input placeholder="普通输入框" disable={true}></tui:input>

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
<tui:select placeholder="多选..." clearable={true} tree="{[
  {name:'选项1', value:'v1' ,check: false},
  {name:'Option 2', value:'v2' ,check: false},
  {name:'选项3', value:'v3' ,check: false, children:[
    {name:'Option 3-1', value:'v4' ,check: false},
    {name:'子选项3-2', value:'v5', check: false}
  ]}
 ]}" auto-validate={true} multi-select={true} can-search={true}>
  <tui:verify format="*any">随便选择一个条目</tui:verify>
 </tui:select>

多选和单选的标签是一样的，只是设置 `multiSelect` 属性为 `true`。

属性和事件请参考下拉单选控件。

## [](fa-toggle-down) 自定义选择`(customSelect)`

允许用户设计自己的对话框界面来进行选择，校验和属性可以参考下拉单选框。

外观：
<tui:component src="components/customSelect.html"></tui:component>

HTML代码：

```html
<tui:component handler="customSelect.js">
  <tui:dialog-select name="select" clearable={true} 
      auto-validate={true} title="定制选择" placeholder="定制选择框...">
    <tui:verify format="*any">随便选择点什么</tui:verify>
    <tui:button-group name="valueGroup" type="radio">
      <tui:radio value="v1">测试选项1</tui:radio>
      <tui:radio value="v2">测试选项2</tui:radio>
    </tui:button-group>
  </tui:dialog-select>
</tui:component>
```
JS代码：

```javascript
// customSelect.js
this.use(function(select, valueGroup){
	select.on("open", function(e){
		valueGroup.set("value", this.get("value"));
	});
	select.on("close", function(e){
		this.set("text", valueGroup.get("text"));
		this.set("value", valueGroup.get("value"));
	});
});
```
事件

事件名称 | 描述
--- | ---
open | 选择对话框打开
close | 选择对话框关闭

## [](fa-file) 文件选择`(file)`
工作方式是选择文件后就直接上传到服务器，再随表单一起把文件ID提交给服务器，现代浏览器中，文件选择框还会显示文件上传进度。

外观：
<tui:file placeholder="请选择文件..." accept="text/plain" 
 clearable={true}  action="uploadFile.do"></tui:file>

```html
<tui:file placeholder="请选择文件..." accept="text/plain" 
 clearable={true}  action="uploadFile.do"></tui:file>
```
属性：

属性名 | 描述
--- | ---
accept | 接受的文件类型：text/plain 或者 image/* 等 MIME 类型


## [](fa-file-image-o) 图片上传`(picture)`

<tui:picture action="/upload"></tui:picture>

由于本文没有后台代码，所以无法演示图片上传。

HTML代码：

```html
<tui:picture></tui:picture>
```

不允许更改的图片，请添加 `disable={true}` 属性。

属性：

属性名 | 描述
--- | ---
action | 文件上传的地址
accept | 接受的图片类型，如： image/png 或 image/jpg 或 image/* 等，不管 accept 如何设定，控件只允许上传 png,jpg,gif 类型的图片文件。
value | 存储文件ID
url | 图片展示的地址

## [](fa-calendar-o) 日期选择`(datePicker)`
外观：
<tui:date-picker id="mytest" placeholder="选择日期"></tui:date-picker>

HTML代码：

```html
<tui:date-picker placeholder="选择日期"></tui:date-picker>
```

<tui:date-picker id="testDate" placeholder="选择日期和时间" mode="date-time" class="big"></tui:date-picker>

HTML代码：

```html
<tui:date-picker placeholder="选择日期和时间" mode="date-time">
</tui:date-picker>
```

<tui:date-picker placeholder="选择年月"  mode="month"></tui:date-picker>

```html
<tui:date-picker placeholder="选择年月" mode="month">
</tui:date-picker>
```

<tui:date-picker placeholder="选择时间"  mode="time"></tui:date-picker>

```html
<tui:date-picker placeholder="选择时间" mode="time">
</tui:date-picker>
```

属性：

属性名 | 描述
--- | ---
format | 显示的日期格式
mode | 日期类型（date, date-time, time, month），如果没有设置 format 的话，不同的 mode 会设置不同的缺省 format

## [](fa-calendar) 日历`(calendar)`
外观：
<tui:calendar mode="date-time" style="display:block;"></tui:calendar>

HTML代码：

```html
<tui:calendar mode="date-time" style="display:block;"></tui:calendar>
```
事件

事件名称 | 描述
--- | ---
click | 单击选择日期
dblclick | 双击选择日期


## [](fa-clone) 弹出层`(popup)`
弹出层可以一层一层的层叠打开。

外观：
<tui:component src="components/popup.html"></tui:component>

HTML代码：

```html
<tui:component handler="popup.js">
	<tui:button name="popBtn">弹出层</tui:button>
	<tui:popup name="popup">
		<div style="width:200px;height:100px;text-align:center;line-height:100px;">
		这是一个弹出层
		</div>
	</tui:popup>
</tui:component>
```
JS代码：

```javascript
this.use(function(popup, popBtn){
	popBtn.on("click", function(){
		popup.open(popBtn._);
	});
});
```

事件

事件名称 | 描述
--- | ---
open | 弹出层打开
close | 弹出层关闭

## [](fa-bars) 弹出菜单`(menu)`
弹出菜单是由弹出层派生的，可以实现任意多的自菜单。

外观：
<tui:component src="components/menu.html"></tui:component>

HTML代码：

```html
<tui:component handler="menu.js">
	<tui:button name="popBtn">弹出菜单</tui:button>
	<tui:menu name="menu" class="tui-big">
		<tui:item icon="fa-user" shortcut="Ctrl+A">菜单项1</tui:item>
		<tui:item type="check" checked="{true}" >第二个菜单项</tui:item>
		<tui:item text="子菜单">
			<tui:item type="radio" checked="{true}">子菜单项1</tui:item>
			<tui:item type="radio" >第二个菜单项</tui:item>
			<tui:item type="radio" >菜单项2</tui:item>
			<tui:item type="radio" >菜单项3</tui:item>
		</tui:item>
		<tui:item disable="{true}">菜单项2</tui:item>
		<tui:item>菜单项3</tui:item>
		<tui:item text="子菜单" shortcut="Ctrl+Alt+S">
			<tui:item>子菜单项1</tui:item>
			<tui:item>第二个菜单项</tui:item>
			<tui:item>菜单项2</tui:item>
			<tui:item>菜单项3</tui:item>
			<tui:item text="第二个菜单项子菜单">
				<tui:item>子菜单项2</tui:item>
				<tui:item>第二个菜单项</tui:item>
				<tui:item>菜单项2</tui:item>
				<tui:item>菜单项3</tui:item>
			</tui:item>
		</tui:item>
		<tui:item type="line"></tui:item>
		<tui:item text="子菜单">
			<tui:item>子菜单项1</tui:item>
			<tui:item>第二个菜单项</tui:item>
			<tui:item>菜单项2</tui:item>
			<tui:item>菜单项3</tui:item>
		</tui:item>
	</tui:menu>
</tui:component>
```
JS代码：

```javascript
this.use(function(menu, popBtn){
	popBtn.on("click", function(){
		menu.open(popBtn._);
	});
});
```

事件

事件名称 | 描述
--- | ---
click | 单击菜单项
open | 菜单打开
close | 菜单关闭

## [](fa-commenting) 对话框`(dialog)`
外观：
<tui:component src="components/dialog.html"></tui:component>

HTML代码：

```html
<tui:component handler="dialog.js">
  <div>
    <tui:button name="btnMsg">普通消息</tui:button>
    <tui:button name="btnInfo">提示消息</tui:button>
    <tui:button name="btnOk">成功消息</tui:button>
    <tui:button name="btnWarn">警告消息</tui:button>
    <tui:button name="btnErr">错误消息</tui:button>
    <tui:button name="btnAsk">询问</tui:button>
    <tui:button name="btnWait">等待</tui:button>
  </div>
</tui:component>
```

JS代码：

```javascript
// dialog.js
this.use(function(btnMsg, btnInfo, btnOk, btnWarn, btnErr, btnAsk, btnWait){
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

  // 多个等待事件并发，并不会弹出多个等待框，而是在同一框中显示不同的信息
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
});
```

事件

事件名称 | 描述
--- | ---
btnclick | 单击对话框底部的按钮
open | 对话框打开
close | 对话框关闭

方法

方法名称 | 描述
--- | ---
open() | 打开对话框
close() | 关闭对话框
tui.msgbox() | 静态，弹出普通消息框
tui.infobox() | 静态，弹出通知消息框
tui.okbox() | 静态，弹出成功消息框
tui.errbox() | 静态，弹出错误消息框
tui.warnbox() | 静态，弹出警告消息框
tui.askbox() | 静态，弹出询问消息框
tui.waitbox() | 静态，弹出等待消息框

## [](fa-sliders) 滚动条`(scrollbar)`
外观：
<tui:component src="components/scrollbar.html"></tui:component>

HTML代码：

```html
<tui:component handler="scrollbar.js">
	<tui:scrollbar name="scrollbar" 
		direction="horizontal" 
		total="{1000}" 
		page="{20}" style="width: 100%"></tui:scrollbar>
	<div name="info"></div>
</tui:component>
```

JS代码：

```javascript
// scrollbar.js
// 滚动的时候显示当期的值
this.use(function(scrollbar, info){
	scrollbar.on("scroll", function(e){
		info.innerHTML = e.data.value;
	});
});
```

事件

事件名称 | 描述
--- | ---
scroll | 滚动事件

## [](fa-table) 数据网格`(grid)`
外观：
<tui:component src="components/grid.html"></tui:component>

HTML代码：

```html
<tui:component handler="grid.js">
	<tui:grid name="grid" style="height:300px;"
		auto-height={false} 
		header={true}  
		auto-width={false}
		sort-column={1}
		sort-type="asc">
	</tui:grid>
</tui:component>
```

JS代码：

```javascript
// grid.js 一般来说数据都是由服务器返回的，这里使用 javascript 生成假数据来演示
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
```

属性：

属性名 | 描述
--- | ---
data | 数据内容，要求是个 DS 对象或者数组
list | 数据内容，要求是个 DS 对象或者数组（明确不支持嵌套数据）
tree | 数据内容，要求是个 DS 对象或者数组（明确支持嵌套数据）
columns | 表格的列定义
sortColumn | 排序列
sortType | 排序类型
scrollTop | 垂直滚动距离
scrollLeft | 水平滚动距离
activeRow | 当前选择的行
activeRowData | 当前选择的行数据项
activeColumn | 当前选择的列
selectable | 是否可以选择（打勾）
autoWidth | 自动宽度（如果是 false 就会使用水平滚动条）
autoHeight | 自动高度（如果是 false 就会使用垂直滚动条）

事件

事件名称 | 描述
--- | ---
rowclick | 单击行
rowdblclick | 双击行
sort | 排序事件
rowcheck | 行打勾
keyselect | 键盘选择行

方法

方法名称 | 描述
--- | ---
scrollTo() | 滚动到某行
setSortFlag() | 进行排序

## [](fa-th-list) 数据列表`(list)`
外观：
<tui:list style="height:200px;width:300px;margin:20px" 
			checkable={true} row-tooltip-key="desc" data="{[
				{name: '列表内容1(不可选)', value: 'value1', desc: '这是一个很长的描述信息1'},
				{name: 'List Item 2', check:false,  value: 'value2', desc: '这是一个很长的描述信息2'},
				{name: '列表内容3', check:false, value: 'value3', desc: '这是一个很长的描述信息3'},
				{name: 'List Item 4', check:true, value: 'value4', desc: '这是一个很长的描述信息4'},
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

HTML代码：

```html
<tui:list style="height:200px;width:300px;margin:20px" 
  checkable={true} row-tooltip-key="desc" data="{[
    {name: '列表内容1(不可选)', value: 'value1', desc: '这是一个很长的描述信息1'},
    {name: 'List Item 2', check:false,  value: 'value2', desc: '这是一个很长的描述信息2'},
    {name: '列表内容3', check:false, value: 'value3', desc: '这是一个很长的描述信息3'},
    {name: 'List Item 4', check:true, value: 'value4', desc: '这是一个很长的描述信息4'},
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
```

属性、事件等都合 Grid 一致，区别就是没有 header 只有一列，另外样式稍有不同。


## [](fa-object-ungroup) 组件化开发`(component)`

在 <a href="#quickStart">快速开始</a> 中已经大致描述过组件化开发的概念了，所谓组件就是 TUI2 提供的一个标签：`tui:component`
  这个标签，就像C语言中的 `include` 和 java 中的 `import` 一样，都是把别的文件中定义的代码引入本文件，
  这样通过把功能分割到不同的文件中，再相互包含引用，以实现良好的代码组织形式。

一个基本的组件包括了页面模板和控制器代码两部分，页面模板就是 HTML 的标签组合，使用 HTML 标签可以直观的
  设计组件的外观，控制器代码部分描述了组件实现的业务逻辑，根据响应各子组件产生的事件，调用子组件或全局服务的方法
  来创造新的逻辑模块，这样组件还可以层层封装成更为复杂的组件。

组件定义的形式为：

```html
<tui:component handler="xxx.js">
  ...
  <xxx name="obj1">
    ...
  </xxx>
  ...
</tui:component>
```

组件的控制器中使用依赖注入来生成对子组件或HTML元素的引用：

```javascript
this.use(function(obj1, obj2, $svc1, $svc2, ...){
  var me = this;

  // 声明组件方法
  this.myMethod = function(){
    ...
  };

  obj1.on("xxx", function(e){
    obj2.someMethod("...");
    ...
    $svc1.doSomeThing();
    ...
    // 触发组件事件
    me.fire("newEvent", {some:"data"});
  });
});
```

使用 `$` 开头的变量是注入全局服务，其他的是注入本组件的子组件（TUI控件）或HTML元素，
  可以看到组件标签清晰的描述了业务逻辑实现，且做到了 HTML 和 JS 的完全分离。
  灵活地使用组件是开发 SPA 应用必不可少的重要手段。

组件引用的形式为：

```html
<tui:component src="someComponent.html"></tui:component>
```


## [](fa-window-maximize) 嵌入页`(frame)`

嵌入页 `<tui:frame>` 控件和标准 HTML 标签 `iframe` 非常类似，区别是嵌入页的文档元素是直接加入到当前页面中的，
  而 `iframe` 是单独创建了一个容器把子页面和当前页隔离的开来，我不推荐使用 `iframe` 元素，除非是要引入站外页面，
  否则把子页引入到本页中会比较便于开发，各种交互也比较容易，当然为了各个页面不会互相干扰破坏，建议每个页面都按照组件的形式进行开发。
  使用TUI2提供的组件标签，可以完全不使用 ID 这种全局名称，所以不会出现命名冲突。

一个使用 `<tui:frame>` 的例子：
<tui:component src="components/frame.html"></tui:component>

# 扩展插件

## [](fa-list-ul) 导航菜单`(navigator)`

外观请参考左侧的导航菜单。

HTML代码：

```html
<tui:navigator selectable={true} items={[
  ...
]}></tui:navigator>
```


## [](fa-map) 地理位置`(location)`

地址位置插件可以让你通过地图的点击快速的输入地址信息，它使用的是高德地图。受限于地图本身，如果想要输入的是国外地址就力所不及了。
  地理位置控件也可以在表单控件中使用。

<tui:location app-key="e8f7d3075fc92aea2cb27947ce567763" placeholder="请选择地点..." clearable={true}></tui:location>

HTML代码：

```html
<tui:location app-key="e8f7d3075fc92aea2cb27947ce567763" 
  placeholder="请选择地点..." 
  disable={true}></tui:location>
```

属性：（Input 的子集）

属性名 | 描述
--- | ---
value | 地址信息（可以选择也可以输入）
validate | 定义验证规则，通过属性定义需要传递 JSON 格式的对象，也可以通过 tui:verify 子标签定义
autoValidate | 是否自动验证
clearable | 是否可以清除
placeholder | 占位信息


# 表单控件`(form)`

表单控件是一个美观而强大的、可以大大提高工作效率的综合型工具，它把 TUI2 提供的输入元素全部集中了起来，以可视化的方式让开发人员或用户进行编辑，
  编辑的结果使用 `JSON` 格式进行保存后，可以随时提取出来渲染成表单，供用户录入数据。表单控件有两个模式：**设计模式**和**输入模式**，
  设计模式供开发人员或表单设计人员（可能是某些高级用户）操作设计表单的数据项和外观，输入模式供一般的数据录入人员（普通用户）使用。
  无论是设计模式还是输入模式都可以工作在移动设备的浏览器上，表单是支持响应式布局的。

组件的使用：

```html
<tui:form mode="design" title="表单标题"></tui:form>
```

由于表单控件可能占用的面积较大，所以我以一个单独的页面来展示表单控件：[表单例子](form.html)


# 工具和服务

其实根据项目中的经验来看，除了AJAX，路由和服务外，TUI2提供的大部分工具函数都很少用到，这些函数有些只是内部被框架自己使用，
  所以也可以不用太了解这些函数。

## [](fa-gear) 服务`(service)`
TUI2 中脚手架代码都使用静态函数的方式提供，并没有预制什么服务，但是用户可以通过 service 接口注册自己服务。

注册服务：

从文件中加载服务，一个文件一个服务：

```javascript
tui.service.load(['service1.js', 'service2.js']);
```

或者手工注册服务：

```javascript
tui.service.register('name1', function(){
  this.use(function($svc1, $svc2){
    this.method1 = function(){
      // do sth...
    };
  });
});

// 注册多个服务
...

// 注册完成
tui.service.ready();
```

服务的引用可以通过依赖注入在组件或其他服务中使用，或者通过 `tui.service.get()` 方法获取

服务相关的常用方法：

方法名称 | 描述
--- | ---
tui.service.load() | 加载服务
tui.service.register() | 注册一个服务
tui.service.ready() | 标记服务全都注册完成
tui.service.onReady() | 当所有服务注册完成时调用，参数是一个回调函数，如果执行的时候已经都 ready 了就立即回调
tui.service.get() | 根据名称获取一个服务

## [](fa-sitemap) 路由`(router)`
路由函数，在单页应用中用来记录历史和控制跳转。

JS代码：

```javascript
// 在首页的开始就注册路由表，然后在处理函数中使用 tui:frame 进行页面跳转
tui.browser.startRouter([
  {
    state: "/test",
    url: "page2.html"
  }, {
    state: "/",
    url: "page1.html",
  }
], function(state, hash, url){
  $$("rootContainer").go(url);
});
```

路由通过匹配当前 URL 的 HASH 部分来执行路由规则，如果没有匹配的规则，则执行 `"/"` 对应的规则，称之为默认规则。

路由相关的常用方法：

方法名称 | 描述
--- | ---
tui.browser.startRouter() | 启动一个路由表监听
tui.browser.stopRouter() | 停止一个路由表监听

## [](fa-exchange) AJAX`(ajax)`

一组 HTTP AJAX 函数封装，来简单的执行 POST，GET 等与服务器的交互操作，它内部封装了 jQuery 的 Ajax 操作，
 同时在操作的过程中可以选择性的显示加载等待框，如果出错还会提供标准的错误对话框，使得操作更为友好简单。

如：

```javascript
$post("some/url/xxx", {data: "value"}).done(function(result, xhr){
  // success...
}).fail(function(status, message, xhr){
  // failed...
});
```

方法：

 方法 | 短名 | 描述
--- | --- | ---
tui.ajax.send(url, method, data, options) | $ajax | 发送（获取）数据到（从）服务器
tui.ajax.post(url, data, options) | $post() | 执行 HTTP POST 方法
tui.ajax.get(url, data, options) | $get() | 执行 HTTP GET 方法
tui.ajax.post_(url, data, options) | $post_() | 静默执行 HTTP POST 方法
tui.ajax.get_(url, data, options) | $get_() | 静默执行 HTTP GET 方法
tui.ajax.getScript(url) | 无 | 静默获取一个脚本文件内容（与jQuery不同，不会执行该脚本）
tui.ajax.getBody(url) | 无 | 静默获取一个 HTML 页面中 body 的部分
tui.ajax.getComponent(url) | 无 | 静默获取一个 HTML 页面中的组件定义
tui.ajax.getFunction(url, param) | 无 | 静默获取一个脚本文件并返回一个封装的闭包函数

## [](fa-clock-o) 时间`(time)`

一组和时间相关的函数，用来格式化或解析时间字符串，或计算时间间隔。

方法：

 方法 | 描述
--- | ---
tui.time.timespan(seconds, language) | 显示时间间隔，如：3天2小时
tui.time.dateDiff(dt1, dt2, unit = 'd') | 计算时间间隔
tui.time.dateAdd(dt, val, unit = 'd') | 时间加间隔求一个新时间
tui.time.dayOfYear(dt) | 获取这个日期是一天中的第多少天
tui.time.totalDaysOfMonth(dt) | 获取这个日期所在的月共有多少钱
tui.time.parseDate(dtStr, format?) | 解析一个日期字符串，可以执行格式
tui.time.formatDate(dt, dateFmt = "yyyy-MM-ddTHH:mm:sszzz") | 格式化日期



## [](fa-file-text-o) 字符串`(string)`
一组和字符串操作相关的附加函数。

方法：

 方法 | 描述
--- | ---
tui.text.parseBoolean(value) | 解析boolean值，yes true y 1 等都解析成 true
tui.text.format(template, params) | 格式化字符串
tui.text.toDashSplit(word) | 把驼峰风格的命名字符串格式化成用减号隔开的形式
tui.text.toCamel(word, strict = false) | 把减号或下划线分割的单词格式化成驼峰命名
tui.text.paddingNumber(v, min, max?, alignLeft = false) | 用0填充一个数字
tui.text.getUrlParam(url, key) | 获取一个URL中的某个查询参数
tui.text.getUrlAnchor(url) | 获取一个URL中的锚点
tui.text.isAbsUrl(url) | 判断一个地址是否是绝对地址
tui.text.getBaseUrl(url) | 获取一个地址中的基地址
tui.text.joinUrl(path1, path2, ...) | 连接地址


## [](fa-sitemap) 浏览器相关`(browser)`
一组和字符串操作相关的附加函数。

方法：

 方法 | 描述
--- | ---
tui.browser.backupScrollPosition(target) | 保存一个元素的滚动位置
tui.browser.focusWithoutScroll(target) | 让某个元素获取焦点但不滚动页面
tui.browser.scrollToElement(target, distance?, callback?) | 滚动页面以显示某个元素,这个是有动画的
tui.browser.toElement(str, withParentDiv = false) | 用 HTML 字符串创建元素
tui.browser.toHTML(node 或 nodeList) | 把元素或元素集合转换成 HTML 字符串
tui.browser.removeNode(node) | 把元素从文档中移除
tui.browser.toSafeText(str) | 转换成安全的文字,转移 HTML 的标签符号
tui.browser.getNodeText(node) | 获取元素的纯文本
tui.browser.setNodeText(node, text) | 设置素的纯文本
tui.browser.getNodeOwnText(node) | 获取元素的纯文本,不包括子元素
tui.browser.getRectOfParent(node) | 获取相对于父元素的位置和大小
tui.browser.getRectOfPage(node) | 获取相对于页面的位置和大小
tui.browser.getRectOfScreen(node) | 获取相对于窗口的位置和大小
tui.browser.getTopBody() | 获取顶层的 body
tui.browser.getWindow(node) | 获取一个元素对应的窗口
tui.browser.getWindowScrollElement() | 获取浏览器的顶层滚动对象(不同的浏览器是不一样的)
tui.browser.keepToTop(node, top) | 让某个元素置顶
tui.browser.cancelKeepToTop(node) | 让某个元素置顶
tui.browser.getCurrentStyle(node) | 获取元素当前计算后的样式
tui.browser.isLButton(event) | 判断当前事件中是否是鼠标左键的点击动作
tui.browser.banBackspace() | 禁止浏览器使用退格键返回上一浏览记录
tui.browser.cancelDefault(event) | 禁用缺省事件处理操作
tui.browser.cancelBubble(event) | 禁止事件冒泡
tui.browser.isAncestry(node, parent) | 判断是否祖先节点
tui.browser.isPosterity(node, child) | 判断是否后代节点
tui.browser.isFireInside(node, event) | 判断事件是否是在元素内触发的
tui.browser.isInDoc(node) | 判断元素是否位于文档内
tui.browser.saveCookie(name, value, expires?, path?, domain?, secure = false) | 保存 cookie
tui.browser.loadCookie(name) | 获取 cookie
tui.browser.deleteCookie(name, path?, domain?) | 删除 cookie
tui.browser.saveData(key, value, sessionOnly = false) | 保存数据到 localStore 或 sessionStore 如果没有这些存储就存到 cookie 里
tui.browser.loadData(key, sessionOnly = false) | 提取数据
tui.browser.deleteData(key, sessionOnly = false) | 删除数据
tui.browser.addAccelerate(key, actionId) | 增加一个全局快捷键
tui.browser.deleteAccelerate(key, actionId) | 删除一个全局快捷键
tui.browser.getUrlParam(key) | 获取当前页面的路径查询参数
tui.browser.getEventPosition(e, allFingers = false) | 获取触摸事件中触摸点的位置
tui.browser.setInnerHtml(node, html) | 设置元素的源代码(兼容IE8)
tui.browser.createUploader(node, options) | 使一个元素可以点击上传文件

## [](fa-language) 多语言`(lang)`

TUI2 中的组件都支持多语言,同时提供了一组函数用来处理前台的多语言的问题。
通过设置 tui.lang 变量来修改全局的语言设置。

```html
<script src="tui2.js"></script>
<script>
  tui.lang = "zh-CN";
</script>
```

方法：

 方法 | 描述
--- | ---
tui.dict(lang, translator) | 为某个语言设置一个字典
tui.str(str, lang?) | 获取一个字符串的本地化翻译，如果lang没有传，就使用 tui.lang 变量


