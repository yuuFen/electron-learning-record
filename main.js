// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView } = require('electron')
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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
