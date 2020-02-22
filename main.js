// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView, globalShortcut, ipcMain, Menu } = require('electron')
const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false, // 边框、顶部菜单
    show: false, // new时不显示，等到ready-to-show时再显示
    // backgroundColor: '#eee',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: true,
    },
  })

  // 优雅的显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  // // 子渲染进程
  // childWindow = new BrowserWindow({
  //   parent: mainWindow, // 指定父窗口
  //   // modal: true, // 模态窗口，存在时禁用父窗口（现在都用全屏遮罩了）
  // })
  // //BrowserView
  // const view = new BrowserView()
  // // api https://www.electronjs.org/docs/api/browser-view
  // view.setBounds({
  //   x: 10,
  //   y: 10,
  //   width: 300,
  //   height: 200,
  // })
  // view.webContents.loadURL('https://yuufen.com')
  // mainWindow.setBrowserView(view)

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  setTimeout(() => {
    mainWindow.webContents.send('asynchronous-reply', '这是主进程主动发送的消息')

    // // 可以设置所有渲染进程默认的顶部菜单
    // const template = [
    //   { label: '第一个菜单项目' },
    //   {
    //     label: '点击测试',
    //     click: () => {
    //       console.log('点击测试')
    //     },
    //   },
    //   { role: 'undo' },
    //   { type: 'separator' },
    //   { label: '第三个菜单项目' },
    //   { label: '第四个菜单项目' },
    // ]
    // const menu = Menu.buildFromTemplate(template)
    // Menu.setApplicationMenu(menu)
    // // menu.popup()
  }, 2000)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  // 注册一个 'CommandOrControl+X' 的全局快捷键(焦点不在程序时也生效)
  const ret = globalShortcut.register('CommandOrControl+O', () => {
    console.log('CommandOrControl+O is pressed') // 主线程的log
  })
  if (!ret) {
    console.log('registration failed')
  }
  // 检查快捷键是否注册成功
  console.log('CommandOrControl+O：', globalShortcut.isRegistered('CommandOrControl+O'))
})
app.on('will-quit', () => {
  // 注销快捷键
  globalShortcut.unregister('CommandOrControl+O')
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// ipc 进程间通信
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
