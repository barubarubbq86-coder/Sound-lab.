(() => {
  'use strict';
  const LANGS = {
    en: { name: '🇬🇧 えいご・IPA', lang: 'en-GB', examples: [['こんにちは','həˈloʊ'],['ねこ','kæt'],['ありがとう','θæŋk juː']] },
    fr: { name: '🇫🇷 フランスご・IPA', lang: 'fr-FR', examples: [['こんにちは','bɔ̃ʒuʁ'],['ありがとう','mɛʁsi']] },
    es: { name: '🇪🇸 スペインご・IPA', lang: 'es-ES', examples: [['こんにちは','ˈola'],['ありがとう','ˈɡɾasjas']] },
    de: { name: '🇩🇪 ドイツご・IPA', lang: 'de-DE', examples: [['こんにちは','haˈloː'],['ありがとう','ˈdaŋkə']] },
    zh: { name: '🇨🇳 ちゅうごくご・ピンイン', lang: 'zh-CN', examples: [['こんにちは','nǐ hǎo'],['ありがとう','xiè xie'],['ちゅうごく','zhōng guó']] },
    ja: { name: '🇯🇵 にほんご・かな', lang: 'ja-JP', examples: [['こんにちは','こんにちは'],['ありがとう','ありがとう']] },
    ko: { name: '🇰🇷 かんこくご・ハングル', lang: 'ko-KR', examples: [['こんにちは','안녕'],['ありがとう','고마워'],['ぼいんの れんしゅう','아야어여']] }
  };
  const PADS = {
    ipa: [ ['ぼいん','i y ɪ ʏ e ø ɛ œ æ a ɑ ɒ ɔ o u ʊ ə ɜ ɐ ʌ ɯ ɨ'.split(' ')], ['しいん','p b t d k ɡ m n ŋ f v θ ð s z ʃ ʒ h tʃ dʒ ɹ r ʁ l j w ɾ x ç'.split(' ')], ['ながさ・アクセント',['ˈ','ˌ','ː','̃','ʰ','ʲ','̩','.']] ],
    zh: [ ['こえの たかさが かわる',['ā','á','ǎ','à','ē','é','ě','è','ī','í','ǐ','ì','ō','ó','ǒ','ò','ū','ú','ǔ','ù','ǖ','ǘ','ǚ','ǜ']], ['よくつかう もじ','a b c d e f g h i j k l m n o p q r s t u w x y z ü'.split(' ')] ],
    ja: [ ['ひらがな','あ い う え お か き く け こ さ し す せ そ た ち つ て と な に ぬ ね の は ひ ふ へ ほ'.split(' ')], ['つづき','ま み む め も や ゆ よ ら り る れ ろ わ を ん が ぎ ぐ げ ご ざ じ ず ぜ ぞ だ ぢ づ で ど ば び ぶ べ ぼ ぱ ぴ ぷ ぺ ぽ ゃ ゅ ょ っ ー'.split(' ')] ]
  };
  // Unicode Hangul syllables: 19 initials × 21 vowels × 28 final positions.
  const KO_INITIALS='ㄱ ㄲ ㄴ ㄷ ㄸ ㄹ ㅁ ㅂ ㅃ ㅅ ㅆ ㅇ ㅈ ㅉ ㅊ ㅋ ㅌ ㅍ ㅎ'.split(' ');
  const KO_VOWELS='ㅏ ㅐ ㅑ ㅒ ㅓ ㅔ ㅕ ㅖ ㅗ ㅘ ㅙ ㅚ ㅛ ㅜ ㅝ ㅞ ㅟ ㅠ ㅡ ㅢ ㅣ'.split(' ');
  const KO_FINALS='ㄱ ㄲ ㄳ ㄴ ㄵ ㄶ ㄷ ㄹ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅁ ㅂ ㅄ ㅅ ㅆ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ'.split(' ');
  const $ = id => document.getElementById(id);
  const options = () => Object.entries(LANGS).map(([key,v]) => `<option value="${key}">${v.name}</option>`).join('');
  const state = { mixed:false, single:[], mix:[], speaking:0, history:readHistory(), koRefresh:null, koDraft:{single:{initial:null,vowel:null,final:0,index:null},mix:{initial:null,vowel:null,final:0,index:null}} };
  $('language').innerHTML=options(); $('language').value='en';
  function readHistory(){try{const v=JSON.parse(localStorage.getItem('itchan-sounds-v1'));return Array.isArray(v)?v.filter(r=>Array.isArray(r.items)&&r.items.every(i=>LANGS[i.lang]&&typeof i.text==='string')).slice(0,60):[];}catch{return [];}}
  function saveHistory(){try{localStorage.setItem('itchan-sounds-v1',JSON.stringify(state.history));}catch{setStatus('きろくを ほぞんできなかったよ。');}}
  function setStatus(value){$('status').textContent=value;}
  function tokens(){return state.mixed?state.mix:state.single;}
  function renderInput(){ $('symbols').textContent=tokens().map(t=>t.text).join(''); }
  function koreanDraft(){return state.koDraft[state.mixed?'mix':'single'];}
  function resetKoreanDraft(){const d=koreanDraft();d.initial=null;d.vowel=null;d.final=0;d.index=null;state.koRefresh?.();}
  function insert(text,lang){resetKoreanDraft();tokens().push({text,lang});renderInput();}
  function hangul(initial,vowel,final=0){return String.fromCharCode(0xAC00+((initial*21+vowel)*28+final));}
  function renderKoreanPad(panel){
    panel.classList.add('korean-pad');
    const note=document.createElement('p');note.className='korean-intro';note.textContent='① はじめの 子音 → ② 母音。ふたつで 1もじ！ ③ おわりの 子音は あとから つけられるよ。';panel.append(note);
    const preview=document.createElement('div');preview.className='korean-preview';preview.setAttribute('aria-live','polite');panel.append(preview);
    const equation=document.createElement('div');equation.className='korean-equation';
    const result=document.createElement('strong');result.className='korean-result';
    const listen=document.createElement('button');listen.type='button';listen.className='korean-listen';listen.textContent='▶ この もじの おと';listen.addEventListener('click',()=>{const d=koreanDraft();if(d.vowel!==null && d.index===tokens().length-1 && tokens()[d.index]?.lang==='ko')speak([{lang:'ko',text:tokens()[d.index].text}],false);});
    preview.append(equation,result,listen);
    const groups=[['① はじめの 子音',KO_INITIALS,'initial'],['② 母音',KO_VOWELS,'vowel'],['③ おわりの 子音（パッチム）',['なし',...KO_FINALS],'final']];
    const rows=[];
    groups.forEach(([label,keys,kind])=>{const section=document.createElement('section');section.className='korean-step';const heading=document.createElement('h4');heading.textContent=label;section.append(heading);const row=document.createElement('div');row.className='keys';rows.push({row,keys,kind});keys.forEach((key,index)=>{const b=document.createElement('button');b.type='button';b.className='key';b.textContent=key;b.setAttribute('aria-label',label+' '+key);b.addEventListener('click',()=>chooseKorean(kind,index,refresh));row.append(b);});section.append(row);panel.append(section);});
    function refresh(){const d=koreanDraft();const left=d.initial===null?'□':KO_INITIALS[d.initial];const middle=d.vowel===null?'□':KO_VOWELS[d.vowel];const last=d.final?` ＋ ${KO_FINALS[d.final-1]}`:'';equation.textContent=`${left} ＋ ${middle}${last} ＝`;
      result.textContent=d.vowel===null?'？':hangul(d.initial,d.vowel,d.final);
      listen.disabled=d.vowel===null||d.index!==tokens().length-1||tokens()[d.index]?.lang!=='ko';
      rows.forEach(({row,kind,keys})=>[...row.children].forEach((b,i)=>{const active=kind==='initial'?i===d.initial:kind==='vowel'?i===d.vowel:i===d.final;b.classList.toggle('selected',active&&!(kind==='final'&&d.vowel===null));b.setAttribute('aria-pressed',String(active&&!(kind==='final'&&d.vowel===null)));}));
    }
    state.koRefresh=refresh;refresh();
  }
  function chooseKorean(kind,index,refresh){const d=koreanDraft();
    if(kind==='initial'){d.initial=index;d.vowel=null;d.final=0;d.index=null;setStatus('つぎは ぼいんを えらんでね。');}
    else if(kind==='vowel'){
      if(d.initial===null||d.index!==null){d.initial=11;d.index=null;d.final=0;}
      d.vowel=index;
      const value=hangul(d.initial,d.vowel);tokens().push({text:value,lang:'ko'});d.index=tokens().length-1;renderInput();setStatus(`${KO_INITIALS[d.initial]} ＋ ${KO_VOWELS[index]} ＝ ${value}！ おとを きいてみよう。`);
    } else {
      if(d.vowel===null||d.index!==tokens().length-1||tokens()[d.index]?.lang!=='ko'){setStatus('まず ① と ② で もじを つくってね。');return;}
      d.final=index;tokens()[d.index].text=hangul(d.initial,d.vowel,d.final);renderInput();setStatus('おわりの 子音を つけたよ。');
    }
    refresh();
  }
  function renderPad(){
    state.koRefresh=null;
    $('keyGroups').replaceChildren();
    $('keyboardTitle').textContent=state.mixed?'ぜんぶの キー':'ことばの キー';
    const lang=$('language').value;
    const layouts=state.mixed?[['ipa','en'],['zh','zh'],['ja','ja'],['ko','ko']]:[[lang==='zh'?'zh':lang==='ja'?'ja':lang==='ko'?'ko':'ipa',lang]];
    layouts.forEach(([pad,language])=>{
      const panel=document.createElement('section');panel.className='pad-section';
      const title=document.createElement('h3');title.textContent=pad==='ipa'?'IPA・はつおん きごう':pad==='zh'?'ピンイン':pad==='ko'?'ハングルを くみたてよう':'ひらがな';panel.append(title);
      if(pad==='ko'){renderKoreanPad(panel);$('keyGroups').append(panel);return;}
      let voiceSelect=null;
      if(state.mixed&&pad==='ipa'){voiceSelect=document.createElement('select');voiceSelect.setAttribute('aria-label','IPAの読み上げ言語');for(const key of ['en','fr','es','de']){const o=document.createElement('option');o.value=key;o.textContent=LANGS[key].name;voiceSelect.append(o);}panel.append(voiceSelect);}
      PADS[pad].forEach(([label,keys])=>{
        const p=document.createElement('p');p.className='key-label';p.textContent=label;
        const row=document.createElement('div');row.className='keys';
        keys.forEach(k=>{const button=document.createElement('button');button.type='button';button.className='key';button.textContent=k;button.setAttribute('aria-label',k+'を入力');button.addEventListener('click',()=>insert(k,voiceSelect?voiceSelect.value:language));row.append(button);});panel.append(p,row);
      });$('keyGroups').append(panel);
    });
  }
  $('spaceKey').addEventListener('click',()=>insert(' ',tokens().at(-1)?.lang||$('language').value));
  $('backspaceKey').addEventListener('click',()=>{tokens().pop();resetKoreanDraft();renderInput();renderPad();});
  $('clearKey').addEventListener('click',()=>{tokens().splice(0);resetKoreanDraft();renderInput();renderPad();});
  function renderExamples(){ $('examples').replaceChildren();if(state.mixed)return;LANGS[$('language').value].examples.forEach(([label,value])=>{const b=document.createElement('button');b.type='button';b.textContent=label+'：'+value;b.addEventListener('click',()=>{state.single=Array.from(value,text=>({text,lang:$('language').value}));resetKoreanDraft();renderInput();renderPad();});$('examples').append(b);});}
  function switchMode(mixed){stop();state.mixed=mixed;resetKoreanDraft();$('single').hidden=mixed;$('mixHint').hidden=!mixed;for(const [id,on]of [['singleMode',!mixed],['mixMode',mixed]]){$(id).classList.toggle('active',on);$(id).setAttribute('aria-pressed',String(on));}renderPad();renderInput();renderExamples();}
  $('singleMode').addEventListener('click',()=>switchMode(false));$('mixMode').addEventListener('click',()=>switchMode(true));
  $('language').addEventListener('change',()=>{resetKoreanDraft();state.single.forEach(t=>t.lang=$('language').value);renderPad();renderExamples();});
  function entries(){const result=[];for(const t of tokens()){const last=result.at(-1);if(last?.lang===t.lang)last.text+=t.text;else result.push({...t});}return result.map(i=>({...i,text:i.text.trim()})).filter(i=>i.text);}
  function ipaToSpelling(input,lang) {
    const common = { 'tʃ':'ch','dʒ':'j','eɪ':'ay','aɪ':'eye','aʊ':'ow','ɔɪ':'oy','oʊ':'oh','əʊ':'oh','ɚ':'er','ɝ':'er','iː':'ee','uː':'oo','ɑː':'ah','ɔː':'aw','ɜː':'er','ɪə':'ear','eə':'air','ʊə':'oor','aː':'a','eː':'e','iː':'ee','oː':'o','uː':'oo' };
    const base = {
      en:{'ʃ':'sh','ʒ':'zh','θ':'th','ð':'th','ŋ':'ng','ɹ':'r','ʁ':'r','ɾ':'d','ɡ':'g','ɪ':'i','ʏ':'u','ɛ':'e','æ':'a','ɑ':'ah','ɒ':'o','ɔ':'aw','ʊ':'u','ə':'uh','ɜ':'er','ɐ':'a','ʌ':'u','ɯ':'u','ɨ':'i','y':'ee','ø':'er','œ':'er','̃':'','ː':'','x':'kh','ç':'h'},
      fr:{'ʃ':'ch','ʒ':'j','θ':'t','ð':'d','ŋ':'ng','ɹ':'r','ʁ':'r','ɾ':'r','ɡ':'g','ɪ':'i','ɛ':'è','æ':'a','ɑ':'a','ɒ':'o','ɔ':'o','ʊ':'ou','ə':'e','ɜ':'eu','ɐ':'a','ʌ':'a','ɯ':'ou','ɨ':'i','y':'u','ø':'eu','œ':'eu','̃':'','ː':'','x':'r','ç':'ch','u':'ou'},
      es:{'ʃ':'sh','ʒ':'y','θ':'z','ð':'d','ŋ':'ng','ɹ':'r','ʁ':'r','ɾ':'r','ɡ':'g','ɪ':'i','ɛ':'e','æ':'a','ɑ':'a','ɒ':'o','ɔ':'o','ʊ':'u','ə':'e','ɜ':'e','ɐ':'a','ʌ':'a','ɯ':'u','ɨ':'i','y':'i','ø':'o','œ':'e','̃':'','ː':'','x':'j','ç':'j'},
      de:{'ʃ':'sch','ʒ':'sch','θ':'t','ð':'d','ŋ':'ng','ɹ':'r','ʁ':'r','ɾ':'r','ɡ':'g','ɪ':'i','ɛ':'e','æ':'a','ɑ':'a','ɒ':'o','ɔ':'o','ʊ':'u','ə':'e','ɜ':'er','ɐ':'er','ʌ':'a','ɯ':'u','ɨ':'i','y':'ü','ø':'ö','œ':'ö','̃':'','ː':'','x':'ch','ç':'ch'}
    }[lang] || {};
    const map={...common,...base};
    if(lang==='fr'){Object.assign(map,{'ɑ̃':'an','ɔ̃':'on','ɛ̃':'in','œ̃':'un','ʁ':'r'});}
    const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
    let text=input.normalize('NFC').replaceAll(/[\/\[\]ˈˌ.]/g,'');
    let result='';for(let i=0;i<text.length;){const found=keys.find(k=>text.startsWith(k,i));if(found){result+=map[found];i+=found.length;}else{result+=text[i++];}}
    return result.replaceAll(/\s+/g,' ').trim();
  }
  const PINYIN_PHRASES = {'nǐ hǎo':'你好','xiè xie':'谢谢','xiè xiè':'谢谢','zhōng guó':'中国','mā mā':'妈妈','wǒ ài nǐ':'我爱你','zài jiàn':'再见','bà ba':'爸爸','péng you':'朋友','zǎo shang hǎo':'早上好'};
  function toSpeech({lang,text}) {if(lang==='zh')return PINYIN_PHRASES[text.toLowerCase().replaceAll(/\s+/g,' ')] || text;if(lang==='ja'||lang==='ko')return text;return ipaToSpelling(text,lang);}
  function voiceFor(code){
    const target=LANGS[code].lang.toLowerCase();
    const all=speechSynthesis.getVoices();
    const allowed=$('allowOtherVoices').checked ? all : all.filter(v=>v.localService===true);
    const exact=allowed.filter(v=>v.lang.toLowerCase().replace('_','-')===target);
    const sameLanguage=allowed.filter(v=>v.lang.toLowerCase().split(/[-_]/)[0]===target.split('-')[0]);
    // When optional voices are enabled, still choose an on-device voice first.
    return exact.find(v=>v.localService===true) || sameLanguage.find(v=>v.localService===true) || exact[0] || sameLanguage[0] || null;
  }
  function stopPlayback(){state.speaking++;if('speechSynthesis'in window)speechSynthesis.cancel();$('stop').disabled=true;$('play').disabled=false;}
  function stop(){stopPlayback();}
  function preflight(items){
    if(!('speechSynthesis'in window)){setStatus('このブラウザでは こえを だせないみたい。');return false;}
    if(!items.length){setStatus('まず きごうを いれてね。');return false;}
    const missing=items.find(i=>!voiceFor(i.lang));
    if(missing){setStatus(LANGS[missing.lang].name+'の こえが みつからないよ。おとなのかたと せっていを みてね。');return false;}
    return true;
  }
  function speak(items,keep=true){
    stop();
    if(!preflight(items))return;
    const id=state.speaking,pitch=Number($('pitch').value),rate=Number($('rate').value);let index=0,started=false;
    $('stop').disabled=false;$('play').disabled=true;
    const next=()=>{if(id!==state.speaking)return;if(index>=items.length){$('stop').disabled=true;$('play').disabled=false;setStatus('よみおわったよ！');return;}
      const item=items[index++],spoken=toSpeech(item);if(!spoken){next();return;}
      const utter=new SpeechSynthesisUtterance(spoken);utter.lang=LANGS[item.lang].lang;utter.voice=voiceFor(item.lang);utter.pitch=pitch;utter.rate=rate;
      utter.onstart=()=>{if(id!==state.speaking)return;setStatus('よんでいるよ…');if(!started&&keep){started=true;state.history.unshift({items:items.map(x=>({...x})),at:Date.now()});state.history=state.history.slice(0,60);saveHistory();renderHistory();}};
      utter.onend=()=>{if(id===state.speaking)next();};utter.onerror=()=>{if(id!==state.speaking)return;stop();setStatus('こえを だせなかったよ。たんまつの おんせい せっていを みてね。');};
      speechSynthesis.speak(utter);
    };next();
  }
  $('play').addEventListener('click',()=>speak(entries()));$('stop').addEventListener('click',()=>{stop();setStatus('とめたよ。');});
  window.addEventListener('pagehide',stop);
  function renderHistory(){const list=$('historyList');list.replaceChildren();$('clearHistory').hidden=!state.history.length;if(!state.history.length){const p=document.createElement('p');p.className='empty';p.textContent='まだ きろくは ないよ。';list.append(p);return;}
    state.history.forEach(row=>{if(!Array.isArray(row.items))return;const b=document.createElement('button');b.type='button';b.className='history-item';const title=document.createElement('strong');title.textContent=row.items.map(i=>i.text).join(' → ');const sub=document.createElement('small');sub.textContent=row.items.map(i=>LANGS[i.lang]?.name || '').join(' → ')+' ・タップで もういちど';b.append(title,sub);b.addEventListener('click',()=>speak(row.items,false));list.append(b);});
  }
  $('clearHistory').addEventListener('click',()=>{if(!confirm('きろくを ぜんぶ けす？'))return;state.history=[];saveHistory();renderHistory();setStatus('きろくを けしたよ。');});
  function updateSliders() {const pitch=Number($('pitch').value),rate=Number($('rate').value);$('pitchValue').textContent=pitch===1?'ふつう':pitch<1?'ひくめ':'たかめ';$('rateValue').textContent=rate===1?'ふつう':rate<1?'ゆっくり':'はやめ';}
  $('pitch').addEventListener('input',updateSliders);$('rate').addEventListener('input',updateSliders);
  renderPad();renderInput();renderExamples();renderHistory();updateSliders();
  if("speechSynthesis" in window)speechSynthesis.getVoices();
})();
