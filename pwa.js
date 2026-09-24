(() => {
  const help=document.getElementById('installHelp'),button=document.getElementById('installApp'),status=document.getElementById('offlineStatus');
  let prompt;
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;button.hidden=false;});
  button.addEventListener('click',async()=>{if(!prompt)return;const event=prompt;prompt=null;button.hidden=true;try{await event.prompt();await event.userChoice;}catch{help.textContent='ブラウザのメニューから「ホーム画面に追加」を選んでください。';}});
  window.addEventListener('appinstalled',()=>{button.hidden=true;help.textContent='インストールできました。ホーム画面から開けます。';});
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>{status.textContent='画面はオフラインでも開けます。読み上げには端末に入っている音声が必要です。';}).catch(()=>{status.textContent='オフライン保存ができませんでした。オンラインで利用できます。';});
  }
})();
