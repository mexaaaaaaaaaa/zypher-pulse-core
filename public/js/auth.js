// [ZypherMC] Login / register form handlers
function bindLoginForm() {
  const f = document.getElementById('login-form');
  if (!f) return;
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const email = f.email.value, pw = f.password.value;
    const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Signing in…';
    const data = await firebaseLogin(email, pw);
    if (data.idToken) { showToast('Welcome back!','success'); setTimeout(()=>location.href='/index.html',600); }
    else { showToast(data.error?.message || 'Login failed','error'); btn.disabled=false; btn.textContent='Login'; }
  });
}
function bindRegisterForm() {
  const f = document.getElementById('register-form');
  if (!f) return;
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const email = f.email.value, pw = f.password.value;
    if (pw.length < 6) return showToast('Password ≥ 6 chars','error');
    const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Creating…';
    const data = await firebaseRegister(email, pw);
    if (data.idToken) {
      localStorage.setItem('zyper_token',data.idToken);
      localStorage.setItem('zyper_uid',data.localId);
      localStorage.setItem('zyper_email',data.email);
      showToast('Account created!','success');
      setTimeout(()=>location.href='/index.html',600);
    } else { showToast(data.error?.message || 'Registration failed','error'); btn.disabled=false; btn.textContent='Create account'; }
  });
}
document.addEventListener('DOMContentLoaded', () => { bindLoginForm(); bindRegisterForm(); });
