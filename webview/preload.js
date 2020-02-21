// 支持 node API
setTimeout(() => {
  alert(document.querySelector('.index-logo-src').src)
  document.querySelector('#su').onclick = () => {
    alert('点击了搜索')
  }
}, 5000)
