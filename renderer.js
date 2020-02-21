// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

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
