riot.tag2('todo', '<ul> <li each="{items}" class="{completed: done}"> <input type="checkbox" __checked="{done}"> {title} </li> </ul>', '', '', function(opts) {

  this.items = [
    { title: 'First item', done: true },
    { title: 'Second item' },
    { title: 'Third item' }
  ]
}, '{ }');

