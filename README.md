## 主进程调试配置
```
{
  // 使用 IntelliSense 了解相关属性。 
  // 悬停以查看现有属性的描述。
  // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name":"Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron.cmd",
      "windows": {
        "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

## 常用事件（生命周期相关）  https://www.electronjs.org/docs/all 

### app

ready: 当 Electron 完成初始化时触发

window-all-closed: 所有窗口被关闭时

before-quit: 在应用程序开始关闭窗口之前

will-quit: 在所有窗口都已关闭且应用将退出时

quit: 当应用程序退出时

### webContents

dom-ready

did-finish-load: 导航完成时触发，即选项卡的旋转器将停止旋转，并指派onload事件后。

DOMContentLoaded

## 实例

### 文件操作

```js
const fs = require('fs')

const dragWrapper = document.getElementById('file-drag')
dragWrapper.addEventListener('drop', (e) => {
  e.preventDefault() // 防止页面迁移（比如打开了拖入的html）
  const files = e.dataTransfer.files
  if (files && files.length > 0) {
    const path = files[0].path
    console.log(path)
    const content = fs.readFileSync(path)
    console.log(content.toString())
  }
})

dragWrapper.addEventListener('dragover', (e) => {
  e.preventDefault()
})
```

### webview  https://www.electronjs.org/docs/api/webview-tag 

```
      <span id="wb-loading"></span>
      <webview id="wb" src="https://www.baidu.com" preload="./webview/preload.js" />
```

```js
// renderer
const wb = document.querySelector('#wb')
const wbLoading = document.querySelector('#wb-loading')
wb.addEventListener('did-start-loading',()=>{
  wbLoading.innerHTML = 'loading...'
})
wb.addEventListener('did-stop-loading',()=>{
  wbLoading.innerHTML = 'done.'
  wb.insertCSS(`
  #su {
    background-color: red;
  }
  `) // 可以注入css来适应应用，而不用修改原页面
  wb.executeJavaScript(`
    setTimeout(() => {
      alert(document.getElementById('su').value)
    }, 2000);
  `)
  wb.openDevTools()
})
```

```js
// preload，支持 node API
setTimeout(() => {
  alert(document.querySelector('.index-logo-src').src)
  document.querySelector('#su').onclick = () => {
    alert('点击了搜索')
  }
}, 5000)
```

### 子窗口 window.open、BrowserWindowProxy

https://www.electronjs.org/docs/api/browser-window-proxy 

```js
// renderer.js
document.querySelector('#new-window-btn').onclick = () => {
  openNewWindow()
}
let subWin
function openNewWindow() {
  subWin = window.open('popupPage.html', '子窗口')
  // api： https://www.electronjs.org/docs/api/browser-window-proxy
}
window.addEventListener('message', (msg) => {
  console.log('接收到的消息:', msg)
})
```

```html
  <!-- popupPage.html -->
  <body>
    <h1>这是弹出的子窗口</h1>
    <button onclick="sendMsgToParent()">像父窗口传递信息</button>
  </body>

  <!-- <script src="./renderer.js"></script> -->
  <script>
    function sendMsgToParent() {
      window.opener.postMessage('我是子窗口，收到回复')
    }
  </script>
```

### 优雅的显示

```js
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false, // 边框、顶部菜单
    show: false, // new时不显示，等到ready-to-show时再显示
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: true,
    },
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
```

### 浏览器窗口 `BrowserWindow`  （渲染进程，只能在main.js（主进程）中使用）

 https://www.electronjs.org/docs/api/browser-window 

```js
// main.js
  childWindow = new BrowserWindow({
    parent: mainWindow, // 指定父窗口
    // modal: true, // 模态窗口，存在时禁用父窗口（现在都用全屏遮罩了）
  })
```

### BrowserView 代替webview

 https://www.electronjs.org/docs/api/browser-view

```js
// main.js
const { app, BrowserWindow, BrowserView } = require('electron')

  const view = new BrowserView()
  // api https://www.electronjs.org/docs/api/browser-view
  view.setBounds({
    x: 10,
    y: 10,
    width: 300,
    height: 200,
  })
  view.webContents.loadURL('https://yuufen.com')
  mainWindow.setBrowserView(view)
```

### Dialog

 https://www.electronjs.org/docs/api/dialog

```js
// 主进程
const { dialog } = require('electron')
console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))
```

```js
// 渲染进程
const { dialog } = require('electron').remote
console.log(dialog)
```

```js
document.getElementById('open-dialog-btn').onclick = () => {
  openDialog()
}
document.getElementById('save-dialog-btn').onclick = () => {
  saveDialog()
}
document.getElementById('message-dialog-btn').onclick = () => {
  MessageDialog()
}
```

#### 打开

```js
function openDialog() {
  const result = dialog.showOpenDialogSync({
    title: '选择一个文件',
    buttonLabel: 'GO GO GO',
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      // { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
      // { name: 'Custom File Type', extensions: ['py'] },
      // { name: 'All Files', extensions: ['*'] },
    ],
  })
  console.log(result) // 返回 文件路径Array / undefined
  // fs
}
```

#### 保存

````js
function saveDialog() {
  const result = dialog.showSaveDialogSync({
    title: '选择要保存的路径',
    // buttonLabel: '保存',
    filters: [
      { name: 'Custom File Type', extensions: ['py'] },
    ],
  })
  console.log(result) // 返回 文件路径 / undefined
  fs.writeFileSync(result, '保存文件测试')
  // fs
}
````

#### 消息盒子

```js
function MessageDialog() {
  const result = dialog.showMessageBoxSync({
    type: 'warning',
    title: 'Are you sure??',
    message: 'Are you really really really really sure?????',
    buttons: ['Cancel', 'OK'], // 看系统的API
  })
  console.log(result) // 当不存在Cancel时，关闭返回0；存在时关闭返回Cancel的index
}
```

### 快捷键

 https://www.electronjs.org/docs/api/global-shortcut 

> `globalShortcut` 模块可以在操作系统中注册/注销全局快捷键, 以便可以为操作定制各种快捷键。
>
> **注意:** 快捷方式是全局的; 即使应用程序没有键盘焦点, 它也仍然在持续监听键盘事件。 在应用程序模块发出 `ready` 事件之前, 不应使用此模块。

#### 主进程

```js
const { app, globalShortcut } = require('electron')

app.on('ready', () => {
  // 注册一个 'CommandOrControl+X' 的全局快捷键
  const ret = globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed')
  })
  if (!ret) {
    console.log('registration failed')
  }
  // 检查快捷键是否注册成功
  console.log(globalShortcut.isRegistered('CommandOrControl+X'))
})

app.on('will-quit', () => {
  // 注销快捷键
  globalShortcut.unregister('CommandOrControl+X')
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})
```

#### 渲染进程

```js
const { globalShortcut } = require('electron').remote

// 热键(渲染进程中)
const ret = globalShortcut.register('CommandOrControl+I', () => {
  console.log('CommandOrControl+I is pressed') // 主进程的log
})
if (!ret) {
  console.log('registration failed')
}
// 检查快捷键是否注册成功
console.log('CommandOrControl+I：', globalShortcut.isRegistered('CommandOrControl+I'))
```

### 主进程核渲染进程的双向通信

 https://www.electronjs.org/docs/api/ipc-main 

 https://www.electronjs.org/docs/api/ipc-renderer 

下面是在渲染和主进程之间发送和处理消息的一个例子：

```javascript
// 在主进程中.
const { ipcMain } = require('electron')
// 异步
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg)
  event.reply('asynchronous-reply', '异步 reply from main')
})
// 同步
ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg)
  event.returnValue = '同步 reply from main'
})
```
```javascript
const { ipcRenderer } = require('electron')
// 异步
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg)
})
ipcRenderer.send('asynchronous-message', '异步消息 from renderer')
// 同步 会等待 event.returnValue
const res = ipcRenderer.sendSync('synchronous-message', '同步消息 from renderer')
console.log(res)
```

### 原生菜单

 https://www.electronjs.org/docs/api/menu

 https://www.electronjs.org/docs/api/menu-item 

#### 主进程

```js
    // 可以设置所有渲染进程默认的顶部菜单 但是一般不这样用
    const template = [
      { label: '第一个菜单项目' },
      {
        label: '点击测试',
        click: () => {
          console.log('点击测试')
        },
      },
      { role: 'undo' },
      { label: '第三个菜单项目' },
      { label: '第四个菜单项目' },
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    // menu.popup()
```

#### 渲染进程

```js
document.getElementById('pop-menu-btn').onclick = () => {
  menu.popup()
}
const template = [
  { role: 'undo' },
  { role: 'redo' },
  { label: '第二个菜单项目' },
  {
    label: '点击测试',
    click: (menuItem, browserWindow, event) => {
      console.log('点击测试')
    },
  },
  { label: '旅游', type: 'checkbox', checked: true },
  { label: '吃', type: 'checkbox', checked: true },
  { label: '喝', type: 'checkbox', checked: false },
  new MenuItem({ label: 'MenuItem' }),
  { label: '子菜单', submenu: [{ label: '子菜单-1' }, { label: '子菜单-2' }, { label: '子菜单-3' }] },
]
const menu = Menu.buildFromTemplate(template)
// Menu.setApplicationMenu(menu)
```

###  `net` 模块 原生的一个发送 HTTP(S) 请求的客户端API (太原始了，一般用封装了的axios，除非想使用系统代理)

```js
//renderer.js
const { net } = require('electron').remote
document.getElementById('access-baidu-btn').onclick = () => {
  const request = net.request('https://www.baidu.com')
  request.on('response', (res) => {
    console.log(`statusCode: ${res.statusCode}`)
    console.log(`header: ${JSON.stringify(res.headers)}`)
    res.on('data', (chunk) => {
      console.log(`chunk: ${chunk.toString()}`)
    })
    res.on('end', () => {
      console.log('end')
    })
  })
  request.end()
}
```

