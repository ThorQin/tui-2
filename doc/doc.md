# 简介`(introduce)`
* TUI2 实现了不同于 *AngularJS*、*ReactJS* 以及 *Vue.js* 的模块化开发方式，
  TUI2 使用更自然的方式对页面和脚本进行模块化的组织，
  不需要使用脚本和标签混合的 JSX 语法，也不需要用 TypeScript 编译打包，使用方式完全回归传统。
  对于习惯使用 jQuery 这种命令式框架的开发人员来说更容易上手。
* NG 等框架只是一个开发框架，仅仅提供了模块化和模板等功能，
  而 TUI2 不仅关注代码的组织形式，还集成了常用的界面UI控件，和常用的脚手架代码，使得集成更为简单。
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
在页面的 HEAD 标签中添加如下引用（或对应的压缩后版本）：
```html
<link rel="stylesheet" href="path/to/font-awesome.css">
<link rel="stylesheet" href="path/to/tui2.css" />
<script type="text/javascript" src="path/to/es5-shim.js"></script>
<script type="text/javascript" src="path/to/jquery-1.11.3.js"></script>
<script type="text/javascript" src="path/to/tui2.js"></script>
```

# 控件
TUI2 提供了一组标准控件，取代了大部分浏览器内置的控件，以便提供统一的外观和操作。

TUI2 JS 中的命名空间使用 `tui`，而控件的命名空间是 `tui.widget`

所有控件继承自 `tui.widget.Widget`

* 对象公共方法：

方法 | 描述 | 参数
--- | --- | ---
get() | 获取某属性 | 属性名, 缺省值(可选)
set() | 设置某属性 | 属性名, 新值
_set() | 设置某属性（不刷新控件） | 属性名, 新值
refresh() | 如果 autoRefresh 为 true 则刷新控件（一般不用） | 无
rander() | 绘制控件 | 无
appendTo() | 把控件加入到某个DOM元素中 | parent, refresh(缺省是)
detach() | 从 DOM 树中分离 | 无
getComponent() | 获取子控件 | name
getNodeName() | 获取控件的完整的 tagName | 无
focus() | 获取焦点 | 无
on() | 绑定事件处理函数 | event（事件名称，多个用空格分开）, func（回调）
once() | 绑定事件处理函数，只触发一次 | event（事件名称）, func（回调）
off() | 解绑处理函数 |  event（事件名称）

<br>
* 对象公共属性

属性 | 描述
--- | ---
id | 唯一标识
parent | 父控件(常用于组中的控件确定所属组)
disable | 禁用（不再接受用户操作）
group | 所属组名（可以使得无父组控件隶属于一个组）
tooltip | 鼠标提示
follow-tooltip | 鼠标跟随提示

<br>
* 常用静态公共方法：

方法 | 快捷方式 | 描述 | 参数
--- | --- | --- | ---
tui.widget.get() | $$() | 根据ID获取控件 | id
tui.widget.create() | $new() | 创建新的控件实例 | type（控件类型，如：button）, initParam（可选）
tui.widget.init() | 无 | 初始化元素及其所有子元素，已经初始化则刷新 | parent(起始元素), initFunc（可选）
tui.widget.search() | 无 | 可以按过滤条件递归查找控件 | searchArea（可选）, filter（可选）



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
document.appendChild(button._);
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
value | 按钮文字
text | 同 value
type | 按钮类型：toggle 、radio 或 toggle-radio
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

## [](fa-dot-circle-o) 多选`(check)`

## [](fa-columns) 页签`(tab)`

## [](fa-th) 按钮组`(group)`

## [](fa-i-cursor) 输入框`(input)`

## [](fa-edit) 多行输入`(text)`

## [](fa-toggle-down) 下拉单选`(select)`

## [](fa-toggle-down) 下拉多选`(multiSelect)`

## [](fa-file) 文件选择`(file)`

## [](fa-calendar-o) 日期选择`(datePicker)`

## [](fa-toggle-down) 自定义选择`(customSelect)`

## [](fa-calendar) 日历`(calendar)`

## [](fa-clone) 弹出层`(popup)`

## [](fa-bars) 弹出菜单`(menu)`

## [](fa-commenting) 对话框`(dialog)`

## [](fa-sliders) 滚动条`(scrollbar)`

## [](fa-table) 数据网格`(grid)`

## [](fa-th-list) 数据列表`(list)`

## [](fa-object-ungroup) 组件化开发`(component)`

## [](fa-window-maximize) 嵌入页`(frame)`

## [](fa-sitemap) 路由`(router)`

# 工具函数

## [](fa-clock-o) 时间`(time)`

## [](fa-file-text-o) 字符串`(string)`

## [](fa-sitemap) 浏览器相关`(browser)`

## [](fa-language) 多语言`(lang)`


