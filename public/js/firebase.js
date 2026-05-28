// [ZypherMC] Firebase REST wrapper — hardcoded credentials, no SDK required
const FIREBASE_URL = "https://zypermc-59d62-default-rtdb.firebaseio.com";
const FIREBASE_API_KEY = "AIzaSyCKWByVXNQ8332fk84KyDfAfKUgsLOwf60";
let FIREBASE_AUTH_TOKEN = localStorage.getItem('zyper_token') || "";

const db = (path) => fetch(`${FIREBASE_URL}${path}.json${FIREBASE_AUTH_TOKEN?'?auth='+FIREBASE_AUTH_TOKEN:''}`).then(r=>r.json());
const dbSet = (path,data) => fetch(`${FIREBASE_URL}${path}.json${FIREBASE_AUTH_TOKEN?'?auth='+FIREBASE_AUTH_TOKEN:''}`,{method:'PUT',body:JSON.stringify(data)}).then(r=>r.json());
const dbPush = (path,data) => fetch(`${FIREBASE_URL}${path}.json${FIREBASE_AUTH_TOKEN?'?auth='+FIREBASE_AUTH_TOKEN:''}`,{method:'POST',body:JSON.stringify(data)}).then(r=>r.json());
const dbDelete = (path) => fetch(`${FIREBASE_URL}${path}.json${FIREBASE_AUTH_TOKEN?'?auth='+FIREBASE_AUTH_TOKEN:''}`,{method:'DELETE'}).then(r=>r.json());
const dbPatch = (path,data) => fetch(`${FIREBASE_URL}${path}.json${FIREBASE_AUTH_TOKEN?'?auth='+FIREBASE_AUTH_TOKEN:''}`,{method:'PATCH',body:JSON.stringify(data)}).then(r=>r.json());

const FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts";
const firebaseLogin = async(email,password)=>{const res=await fetch(`${FIREBASE_AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});const data=await res.json();if(data.idToken){localStorage.setItem('zyper_token',data.idToken);localStorage.setItem('zyper_uid',data.localId);localStorage.setItem('zyper_email',data.email);FIREBASE_AUTH_TOKEN=data.idToken;}return data;};
const firebaseRegister=async(email,password)=>{const res=await fetch(`${FIREBASE_AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});return res.json();};
const firebaseLogout=()=>{localStorage.clear();FIREBASE_AUTH_TOKEN="";window.location.href='/index.html';};

const cacheGet=(key)=>{try{const item=localStorage.getItem('cache_'+key);if(!item)return null;const{data,timestamp}=JSON.parse(item);if(Date.now()-timestamp>300000){localStorage.removeItem('cache_'+key);return null;}return data;}catch{return null;}};
const cacheSet=(key,data)=>localStorage.setItem('cache_'+key,JSON.stringify({data,timestamp:Date.now()}));
const dbCached=async(path)=>{const c=cacheGet(path);if(c)return c;const d=await db(path);if(d)cacheSet(path,d);return d;};

const showToast=(msg,type='info')=>{let c=document.getElementById('toast-container');if(!c){c=document.createElement('div');c.id='toast-container';document.body.appendChild(c);}const t=document.createElement('div');t.className=`toast toast-${type}`;t.textContent=msg;c.appendChild(t);setTimeout(()=>t.remove(),3000);};

console.log('[ZypherMC] Firebase initialized ✅');
