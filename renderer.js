// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// Now `nodeIntegration` is turned on

const fs = require('fs')
const { dialog, globalShortcut, Menu, MenuItem, net } = require('electron').remote
const { ipcRenderer } = require('electron')

// net
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

// 菜单
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

// ipc 进程间通信
document.getElementById('ipc-test-btn').onclick = () => {
  sendMessage()
}
// 异步发送并接收回复
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg)
})
function sendMessage() {
  ipcRenderer.send('asynchronous-message', '异步消息 from renderer')
  // 同步发送并接收回复 会阻塞等待 event.returnValue
  const res = ipcRenderer.sendSync('synchronous-message', '同步消息 from renderer')
  console.log(res)
}

// 热键(渲染进程中)
const ret = globalShortcut.register('CommandOrControl+I', () => {
  console.log('CommandOrControl+I is pressed') // 主线程的log
})
if (!ret) {
  console.log('registration failed')
}
// 检查快捷键是否注册成功
console.log('CommandOrControl+I：', globalShortcut.isRegistered('CommandOrControl+I'))

// dialog
document.getElementById('open-dialog-btn').onclick = () => {
  openDialog()
}
document.getElementById('save-dialog-btn').onclick = () => {
  saveDialog()
}
document.getElementById('message-dialog-btn').onclick = () => {
  MessageDialog()
}
function MessageDialog() {
  const result = dialog.showMessageBoxSync({
    type: 'warning',
    title: 'Are you sure??',
    message: 'Are you really really really really sure?????',
    buttons: ['Cancel', 'OK'], // 看系统的API
  })
  console.log(result) // 当不存在Cancel时，关闭返回0；存在时关闭返回Cancel的index
}
function saveDialog() {
  const result = dialog.showSaveDialogSync({
    title: '选择要保存的路径',
    // buttonLabel: '保存',
    filters: [
      // { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      // { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
      { name: 'Custom File Type', extensions: ['py'] },
      // { name: 'All Files', extensions: ['*'] },
    ],
  })
  console.log(result) // 返回 文件路径 / undefined
  fs.writeFileSync(result, '保存文件测试')
}
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
}

// 打开子窗口
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

// // webview
// const wb = document.querySelector('#wb')
// const wbLoading = document.querySelector('#wb-loading')
// wb.addEventListener('did-start-loading', () => {
//   wbLoading.innerHTML = 'loading...'
// })
// wb.addEventListener('did-stop-loading', () => {
//   wbLoading.innerHTML = 'done.'
//   wb.insertCSS(`
//   #su {
//     background-color: red;
//   }
//   `) // 可以注入css来适应应用，而不用修改原页面
//   wb.executeJavaScript(`
//     setTimeout(() => {
//       alert(document.getElementById('su').value)
//     }, 2000);
//   `)
//   wb.openDevTools()
// })

// 文件拖动
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
