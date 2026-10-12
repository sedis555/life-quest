export const AVATAR_OPTIONS = Object.freeze({
  skinTone: [
    {id:'porcelain',label:'Porcelain',color:'#f4c9ae',shadow:'#dca488'},
    {id:'light',label:'Light',color:'#eeb994',shadow:'#cd9672'},
    {id:'medium',label:'Medium',color:'#cc8c62',shadow:'#a76b49'},
    {id:'warm',label:'Warm brown',color:'#a96b49',shadow:'#804b34'},
    {id:'deep',label:'Deep brown',color:'#784632',shadow:'#583324'},
    {id:'ebony',label:'Ebony',color:'#4e3028',shadow:'#38221e'},
  ],
  faceShape: [{id:'oval',label:'Oval'},{id:'soft',label:'Soft'},{id:'angular',label:'Angular'}],
  eyeStyle: [{id:'almond',label:'Almond'},{id:'round',label:'Round'},{id:'soft',label:'Soft'}],
  eyeColor: [
    {id:'brown',label:'Brown',color:'#4a2d20'}, {id:'hazel',label:'Hazel',color:'#7e6031'},
    {id:'blue',label:'Blue',color:'#487ca0'}, {id:'green',label:'Green',color:'#547b52'},
    {id:'dark',label:'Dark brown',color:'#231c1b'},
  ],
  eyebrow: [{id:'soft',label:'Soft'},{id:'defined',label:'Defined'},{id:'straight',label:'Straight'}],
  nose: [{id:'soft',label:'Soft'},{id:'narrow',label:'Narrow'},{id:'round',label:'Rounded'}],
  mouth: [{id:'smile',label:'Gentle smile'},{id:'neutral',label:'Neutral'},{id:'bright',label:'Bright smile'}],
  freckles: [{id:'none',label:'None'},{id:'light',label:'Subtle freckles'}],
  hairstyle: [
    {id:'short',label:'Short'},{id:'fade',label:'Fade'},{id:'curls',label:'Curls'},
    {id:'braids',label:'Braids'},{id:'locs',label:'Locs'},{id:'afro',label:'Afro'},
    {id:'long-straight',label:'Long straight'},{id:'long-wavy',label:'Long wavy'},
    {id:'ponytail',label:'Ponytail'},{id:'shaved',label:'Shaved'},
  ],
  hairColor: [
    {id:'black',label:'Black',color:'#211b20'}, {id:'brown',label:'Brown',color:'#493126'},
    {id:'chestnut',label:'Chestnut',color:'#774331'}, {id:'auburn',label:'Auburn',color:'#a04f35'},
    {id:'silver',label:'Silver',color:'#abb2bd'}, {id:'teal',label:'Teal',color:'#287e83'},
  ],
  bodyType: [{id:'narrow',label:'Narrow frame'},{id:'balanced',label:'Balanced frame'},{id:'broad',label:'Broad frame'}],
  outfitStyle: [
    {id:'casual',label:'Everyday casual'},{id:'smart',label:'Smart casual'},
    {id:'office',label:'Office wear'},{id:'founder',label:'Business'},{id:'street',label:'Streetwear'},{id:'sport',label:'Sportswear'},
  ],
  topColor: [
    {id:'teal',label:'Teal',color:'#2d9898'}, {id:'blue',label:'Blue',color:'#426cc1'},
    {id:'rust',label:'Rust',color:'#bc684c'}, {id:'plum',label:'Plum',color:'#795486'},
    {id:'gold',label:'Gold',color:'#c79a45'}, {id:'cream',label:'Cream',color:'#ded3b7'},
    {id:'green',label:'Green',color:'#548267'}, {id:'black',label:'Black',color:'#313744'},
  ],
  accessory: [
    {id:'none',label:'None'},{id:'glasses',label:'Glasses'},{id:'watch',label:'Watch'},
    {id:'earrings',label:'Earrings'},{id:'necklace',label:'Necklace'},{id:'cap',label:'Cap'},
  ],
});

export const AVATAR_CATEGORIES = [
  {id:'skinTone',label:'Skin'}, {id:'faceShape',label:'Face & features'},
  {id:'hairstyle',label:'Hair'}, {id:'hairColor',label:'Hair color'}, {id:'bodyType',label:'Frame'},
  {id:'outfitStyle',label:'Outfit'}, {id:'topColor',label:'Color'}, {id:'accessory',label:'Extras'},
];
let avatarRenderId = 0;

export function defaultAvatar(displayName = 'Adventurer') {
  return {
    schemaVersion:1, displayName:String(displayName || 'Adventurer').slice(0,24), pronouns:'',
    skinTone:'medium', faceShape:'oval', eyeStyle:'almond', eyeColor:'brown', eyebrow:'soft',
    nose:'soft', mouth:'smile', freckles:'none', hairstyle:'curls', hairColor:'black',
    bodyType:'balanced', outfitStyle:'smart', topColor:'teal', accessory:'none',
  };
}

export function normalizeAvatar(input, fallbackName = 'Adventurer') {
  const defaults = defaultAvatar(fallbackName);
  if (!input || typeof input !== 'object' || Array.isArray(input)) return defaults;
  const output = { ...defaults };
  for (const [category, options] of Object.entries(AVATAR_OPTIONS)) {
    const candidate = input[category];
    output[category] = options.some(option => option.id === candidate) ? candidate : defaults[category];
  }
  output.displayName = typeof input.displayName === 'string' && input.displayName.trim()
    ? input.displayName.trim().slice(0,24) : defaults.displayName;
  output.pronouns = typeof input.pronouns === 'string' && ['she/her','he/him','they/them'].includes(input.pronouns)
    ? input.pronouns : '';
  output.schemaVersion = 1;
  return output;
}

export function randomAvatar(name = 'Adventurer', random = Math.random) {
  const avatar = defaultAvatar(name);
  for (const [category, options] of Object.entries(AVATAR_OPTIONS)) {
    avatar[category] = options[Math.floor(random() * options.length)].id;
  }
  return avatar;
}

const facePaths = {
  oval:'M140 58 C103 58 91 88 94 128 C97 167 117 187 140 190 C163 187 183 167 186 128 C189 88 177 58 140 58Z',
  soft:'M140 58 C102 58 91 91 95 130 C99 168 119 188 140 190 C161 188 181 168 185 130 C189 91 178 58 140 58Z',
  angular:'M140 58 C103 58 92 87 96 127 C99 161 119 183 140 191 C161 183 181 161 184 127 C188 87 177 58 140 58Z',
};
const hairShape = {
  short:'<path d="M95 105 Q82 57 118 45 Q155 31 179 61 Q193 77 184 111 L176 91 Q145 82 117 96 L100 119Z"/>',
  fade:'<path d="M98 101 Q86 66 111 50 Q143 29 171 48 Q194 64 182 101 L175 83 Q146 72 119 87 L102 112Z"/>',
  curls:'<path d="M92 105 Q77 77 96 60 Q91 42 112 42 Q119 22 137 39 Q151 22 165 41 Q188 35 185 62 Q199 78 185 105 L176 88 Q145 78 115 93 L100 116Z"/>',
  braids:'<path d="M94 102 Q81 63 110 48 Q142 30 171 49 Q193 65 184 103 L175 87 Q145 77 116 93Z"/><path d="M101 86 Q95 126 106 151 M113 83 Q108 126 120 157 M126 80 Q122 124 132 160 M139 79 Q137 122 144 157 M153 81 Q151 121 158 151 M166 84 Q168 118 171 143" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
  locs:'<path d="M93 102 Q81 59 112 45 Q144 28 172 48 Q193 67 183 104 L175 87 Q145 78 115 93Z"/><path d="M101 84 Q96 119 104 151 M114 80 Q110 120 117 163 M128 77 Q124 118 132 168 M143 77 Q141 117 148 164 M157 80 Q158 119 164 157 M171 85 Q173 116 176 145" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>',
  afro:'<path d="M91 115 Q71 91 87 70 Q78 45 101 39 Q105 17 128 34 Q147 16 160 35 Q186 27 188 54 Q205 70 188 96 L180 119 L174 88 Q144 76 114 93 L100 121Z"/>',
  'long-straight':'<path d="M95 105 Q80 57 115 45 Q151 31 178 58 Q193 77 184 105 L184 211 Q169 225 161 206 L163 91 Q140 81 116 94 L115 206 Q104 223 94 209Z"/>',
  'long-wavy':'<path d="M95 105 Q80 57 115 45 Q151 31 178 58 Q193 77 184 105 L187 133 Q177 146 187 160 Q176 178 187 194 Q176 213 166 216 L161 92 Q141 80 116 94 L116 140 Q106 153 117 168 Q108 183 117 198 L107 216 Q91 207 96 188 Q105 174 95 160 Q105 143 95 128Z"/>',
  ponytail:'<path d="M169 58 Q198 52 196 78 Q191 97 177 102 Q193 72 168 72Z"/><path d="M95 104 Q81 60 115 45 Q151 31 178 58 Q192 76 183 104 L175 88 Q145 78 115 94 L100 116Z"/>',
  shaved:'<path d="M97 104 Q91 67 119 54 Q146 43 171 55 Q188 66 183 104 L174 88 Q143 82 116 94Z"/>',
};

export function renderAvatar(input, className = 'avatar-art', sceneOptions = {}) {
  const id = `avatar-${++avatarRenderId}`;
  const a = normalizeAvatar({...normalizeAvatar(input), ...(sceneOptions.outfitStyle ? {outfitStyle:sceneOptions.outfitStyle} : {})});
  const scenePose = ['neutral','thinking','working','celebrating','concerned','talking','studying','presenting'].includes(sceneOptions.pose) ? sceneOptions.pose : 'neutral';
  const sceneExpression = ['neutral','happy','curious','surprised','worried','reflective','confident'].includes(sceneOptions.expression) ? sceneOptions.expression : 'neutral';
  const skin = AVATAR_OPTIONS.skinTone.find(x => x.id === a.skinTone);
  const hair = AVATAR_OPTIONS.hairColor.find(x => x.id === a.hairColor).color;
  const iris = AVATAR_OPTIONS.eyeColor.find(x => x.id === a.eyeColor).color;
  const shirt = AVATAR_OPTIONS.topColor.find(x => x.id === a.topColor).color;
  const frame = {narrow:72,balanced:82,broad:94}[a.bodyType];
  const [rx,ry] = ({oval:[47,66],soft:[49,63],angular:[45,68]})[a.faceShape];
  const eyeY = a.eyeStyle === 'round' ? 125 : 123;
  const eyeRx = a.eyeStyle === 'round' ? 7 : 9;
  const browWidth = a.eyebrow === 'defined' ? 3.6 : 2.4;
  const browShape = a.eyebrow === 'straight' ? 'M111 111 L130 109 M150 109 L169 111' : 'M111 112 Q120 106 130 111 M150 111 Q160 106 169 112';
  const noseShape = a.nose === 'narrow' ? 'M140 122 L137 144 Q140 147 144 144' : a.nose === 'round' ? 'M140 122 L136 143 Q140 150 146 143' : 'M140 122 L138 143 Q141 147 145 143';
  const mouthShape = ({happy:'M126 158 Q140 178 154 158',curious:'M128 160 Q140 171 152 160',surprised:'M136 160 A4 6 0 1 0 144 160 A4 6 0 1 0 136 160',worried:'M128 166 Q140 155 152 166',reflective:'M128 161 Q140 162 152 161',confident:'M128 160 Q140 173 152 160'})[sceneExpression] || (a.mouth === 'neutral' ? 'M128 161 Q140 162 152 161' : a.mouth === 'bright' ? 'M126 158 Q140 178 154 158' : 'M128 160 Q140 171 152 160');
  const shoulders = frame;
  const outfitDetail = ({
    casual:'<path d="M110 226 L140 255 L170 226" fill="none" stroke="#d8e8e6" stroke-opacity=".55" stroke-width="3"/>',
    smart:'<path d="M108 224 L140 257 L172 224 M140 257 L140 298" fill="none" stroke="#dce4df" stroke-opacity=".5" stroke-width="3"/>',
    office:'<path d="M104 222 L140 257 L176 222 M140 257 L140 300 M117 236 L128 244" fill="none" stroke="#e2e9ef" stroke-opacity=".62" stroke-width="3"/>',
    founder:'<path d="M102 226 L140 258 L178 226 M140 258 L140 298" fill="none" stroke="#f5d38f" stroke-opacity=".7" stroke-width="3"/>',
    street:'<path d="M102 229 Q140 264 178 229 M124 236 L140 250 L156 236" fill="none" stroke="#e4d6f0" stroke-opacity=".55" stroke-width="3"/>',
    sport:'<path d="M106 225 L140 256 L174 225 M140 256 L140 298" fill="none" stroke="#d8f4ee" stroke-opacity=".58" stroke-width="3"/>',
  })[a.outfitStyle];
  const freckles = a.freckles === 'light' ? '<g fill="#694333" opacity=".55"><circle cx="119" cy="145" r="1.7"/><circle cx="124" cy="148" r="1.4"/><circle cx="161" cy="145" r="1.7"/><circle cx="156" cy="148" r="1.4"/></g>' : '';
  const accessory = ({
    none:'',
    glasses:'<g fill="none" stroke="#273341" stroke-width="3.2"><rect x="105" y="116" width="28" height="19" rx="8"/><rect x="147" y="116" width="28" height="19" rx="8"/><path d="M133 124 Q140 120 147 124 M103 122 L96 119 M175 122 L183 119"/></g>',
    watch:'<g><rect x="182" y="262" width="9" height="23" rx="3" fill="#e0bd76"/><circle cx="186.5" cy="273" r="4" fill="#203447"/></g>',
    earrings:'<g fill="#e9c578" stroke="#a97838" stroke-width="1"><circle cx="94" cy="143" r="4"/><circle cx="186" cy="143" r="4"/></g>',
    necklace:'<path d="M112 230 Q140 273 168 230" fill="none" stroke="#e3c47d" stroke-width="3"/><circle cx="140" cy="266" r="4" fill="#f4d48b"/>',
    cap:'<path d="M94 91 Q100 42 140 43 Q180 42 186 91 Q143 76 94 91Z" fill="'+hair+'"/><path d="M94 91 Q143 79 188 94" fill="none" stroke="#d7c6a7" stroke-width="4"/>',
  })[a.accessory];
  const poseArtwork = ({
    thinking:'<path d="M108 275 Q119 258 129 251 M129 251 L133 242" fill="none" stroke="url(#'+id+'-skin)" stroke-width="8" stroke-linecap="round"/><circle cx="135" cy="237" r="3" fill="#f0bf6c"/>',
    working:'<path d="M192 267 Q209 272 219 286" fill="none" stroke="url(#'+id+'-skin)" stroke-width="9" stroke-linecap="round"/><rect x="202" y="280" width="25" height="15" rx="2" fill="#8298a6"/><path d="M207 285h15M207 289h10" stroke="#d7e3df" stroke-width="1.5"/>',
    celebrating:'<path d="M104 269 Q89 249 83 231 M176 269 Q192 249 198 231" fill="none" stroke="url(#'+id+'-skin)" stroke-width="10" stroke-linecap="round"/><path d="M77 222l2-7m122 7-2-7" stroke="#f0bf6c" stroke-width="3" stroke-linecap="round"/>',
    concerned:'<path d="M107 270 Q128 286 140 285 Q153 286 173 270" fill="none" stroke="url(#'+id+'-skin)" stroke-width="8" stroke-linecap="round"/>',
    talking:'<path d="M190 268 Q207 257 216 245" fill="none" stroke="url(#'+id+'-skin)" stroke-width="9" stroke-linecap="round"/><path d="M216 239v-8m7 9 4-7" stroke="#f0bf6c" stroke-width="2.5" stroke-linecap="round"/>',
    studying:'<path d="M102 274 Q119 267 140 278 Q161 267 178 274 V298 Q158 291 140 301 Q122 291 102 298Z" fill="#e4dfc9" stroke="#768d99" stroke-width="2"/><path d="M140 278v23M110 281l22 5m16-5 20-5" stroke="#8295a1" stroke-width="1.5"/>',
    presenting:'<path d="M190 269 Q209 258 219 251" fill="none" stroke="url(#'+id+'-skin)" stroke-width="9" stroke-linecap="round"/><path d="M219 251l11-2m-7-5 6 5" fill="none" stroke="#f0bf6c" stroke-width="2.5" stroke-linecap="round"/>',
    neutral:'',
  })[scenePose];
  const sceneBackdrop = sceneOptions.scene ? '' : `<rect x="8" y="8" width="264" height="324" rx="34" fill="url(#${id}-bg)"/><circle cx="222" cy="58" r="42" fill="#f0bf6c" opacity=".12"/><path d="M27 262 Q69 223 99 236 L181 236 Q217 225 253 262 V332 H27Z" fill="#b9d7d5" opacity=".06"/>`;
  const hairSvg = hairShape[a.hairstyle].replaceAll('currentColor', hair);
  const safeClass = /^[a-z0-9 _-]+$/i.test(className) ? className : 'avatar-art';
  return `<svg class="${safeClass} pose-${scenePose} expression-${sceneExpression}" viewBox="0 0 280 340" role="img" aria-label="Player avatar, ${scenePose} pose, ${sceneExpression} expression" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1e5261"/><stop offset="1" stop-color="#182438"/></linearGradient><linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${skin.color}"/><stop offset="1" stop-color="${skin.shadow}"/></linearGradient><linearGradient id="${id}-shirt" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shirt}"/><stop offset="1" stop-color="${shirt}" stop-opacity=".74"/></linearGradient></defs>${sceneBackdrop}<ellipse cx="140" cy="314" rx="79" ry="10" fill="#050a13" opacity=".22"/><path d="M${140-shoulders} 317 Q${140-shoulders+4} 246 111 222 L169 222 Q${140+shoulders-4} 246 ${140+shoulders} 317Z" fill="url(#${id}-shirt)"/>${poseArtwork}<path d="M126 183 L126 224 Q140 243 154 224 L154 183Z" fill="url(#${id}-skin)"/><path d="${facePaths[a.faceShape]}" fill="url(#${id}-skin)"/><path d="M${140-rx} 125 Q${140-rx-12} 116 ${140-rx-10} 137 Q${140-rx-7} 151 ${140-rx+1} 149 M${140+rx} 125 Q${140+rx+12} 116 ${140+rx+10} 137 Q${140+rx+7} 151 ${140+rx-1} 149" fill="url(#${id}-skin)"/><path d="${browShape}" fill="none" stroke="${hair}" stroke-width="${browWidth}" stroke-linecap="round"/><g><ellipse cx="120" cy="${eyeY}" rx="${eyeRx}" ry="${a.eyeStyle==='round'?7:5}" fill="#fff4e8"/><ellipse cx="160" cy="${eyeY}" rx="${eyeRx}" ry="${a.eyeStyle==='round'?7:5}" fill="#fff4e8"/><circle cx="121" cy="${eyeY}" r="3.7" fill="${iris}"/><circle cx="159" cy="${eyeY}" r="3.7" fill="${iris}"/><circle cx="122" cy="${eyeY-1}" r="1.2" fill="#fff"/><circle cx="160" cy="${eyeY-1}" r="1.2" fill="#fff"/></g><path d="${noseShape}" fill="none" stroke="${skin.shadow}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/><path d="${mouthShape}" fill="none" stroke="#813f42" stroke-width="3" stroke-linecap="round"/>${freckles}<g fill="${hair}">${hairSvg}</g>${outfitDetail}${accessory}<circle cx="140" cy="306" r="3" fill="#f0bf6c" opacity=".9"/></svg>`;
}

export function renderSceneAvatar(input, {pose='neutral', expression='neutral', outfitStyle} = {}) {
  return renderAvatar(input, 'scene-avatar-art', {scene:true, pose, expression, outfitStyle});
}
