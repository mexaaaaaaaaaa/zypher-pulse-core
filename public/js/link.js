// [ZypherMC] Account linking helper (login → minecraft name via /link_codes/{code})
async function generateLinkCode() {
  const uid = localStorage.getItem('zyper_uid');
  if (!uid) { showToast('Login first','error'); return; }
  const code = Math.random().toString(36).slice(2,8).toUpperCase();
  await dbSet('/link_codes/'+code, { uid, expiresAt: Date.now()+10*60*1000 });
  return code;
}
async function checkLinkedAccount() {
  const uid = localStorage.getItem('zyper_uid');
  if (!uid) return null;
  return await db('/linked_accounts/'+uid);
}
