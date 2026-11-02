(()=>{const q=id=>document.getElementById(id);let text='',pending=null,loaded=false;const panel=createVoicePanel(q('voicePanel'),()=>text),frame=q('labFrame');
 function mode(lab){panel.stop();try{frame.contentWindow?.speechSynthesis?.cancel()}catch{}q('tripArea').hidden=lab;q('labArea').hidden=!lab;if(lab&&!frame.getAttribute('src'))frame.src='./lab/index.html';}
 frame.addEventListener('load',()=>{loaded=true;if(pending!==null){frame.contentWindow.importTrip(pending);pending=null;}});
 q('tripTab').onclick=q('backTrip').onclick=()=>mode(false);q('labTab').onclick=()=>mode(true);
 q('soundToggle').onclick=()=>{const open=q('soundArea').hidden;q('soundArea').hidden=!open;q('soundToggle').setAttribute('aria-expanded',String(open));if(open)panel.refresh();else panel.stop();};
 q('sendLab').onclick=()=>{pending=text;mode(true);if(loaded){frame.contentWindow.importTrip(pending);pending=null;}};
 window.tripSound={setText(value){text=value;q('soundToggle').hidden=false;},reset(){panel.stop();text='';q('soundToggle').hidden=true;q('soundArea').hidden=true;q('soundToggle').setAttribute('aria-expanded','false');}};
})();
