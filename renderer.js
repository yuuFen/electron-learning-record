// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const fs = require('fs')

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
