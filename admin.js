import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const CFG = {
  projects: [["title","Title"],["desc","Description"],["image","Image (file name like gpk1.jpeg, or full URL)"],["link","Link (project URL)"],["order","Order (1,2,3...)"]],
  skills:   [["name","Skill name"],["icon","Icon class (e.g. fab fa-html5)"],["percent","Percent (0-100)"],["order","Order (1,2,3...)"]]
};
const NUM = ["percent","order"];

const DEFAULTS = {
  skills: [
    {name:"HTML",icon:"fab fa-html5",percent:95,order:1},
    {name:"CSS",icon:"fab fa-css3-alt",percent:90,order:2},
    {name:"JavaScript",icon:"fab fa-js",percent:75,order:3},
    {name:"Python",icon:"fab fa-python",percent:80,order:4}
  ],
  projects: [
    {title:"Portfolio Website",desc:"Responsive personal portfolio using HTML & CSS.",image:"gpk1.jpeg",link:"#",order:1},
    {title:"College Website",desc:"Modern college website with responsive design.",image:"gpk3.jpeg",link:"indax.html",order:2},
    {title:"Landing Page",desc:"Creative landing page with animations.",image:"gpk2.jpeg",link:"#",order:3}
  ]
};

let editId = null;

onAuthStateChanged(auth, u => {
  $("#login").hidden = !!u;
  $("#panel").hidden = !u;
  if (u) show("projects");
});

$("#loginForm").onsubmit = async e => {
  e.preventDefault();
  try { await signInWithEmailAndPassword(auth, $("#email").value, $("#pass").value); }
  catch { $("#err").textContent = "Login failed. Check email/password."; }
};
$("#logout").onclick = () => signOut(auth);
document.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => show(b.dataset.tab));

async function show(t) {
  editId = null;
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  const box = $("#content");
  const snap = await getDocs(collection(db, t));
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (t === "messages") {
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    box.innerHTML = "<h2>Messages</h2>" + (rows.map(m =>
      `<div class="card"><b>${esc(m.name)}</b> (${esc(m.email)})<br><i>${esc(m.subject)}</i><p>${esc(m.message)}</p><button class="red" data-del="${m.id}">Delete</button></div>`
    ).join("") || "<p>No messages yet.</p>");
  } else {
    rows.sort((a, b) => (a.order || 0) - (b.order || 0));
    const fields = CFG[t];
    box.innerHTML = `<h2>${t}</h2><div class="card" id="formBox">` +
      fields.map(([k, l]) => `<label>${l}</label><input id="f_${k}">`).join("") +
      `<button id="saveBtn">Add</button><button id="clearBtn" class="red">Clear</button></div>` +
      (rows.length ? "" : `<button id="seed">Import current site data</button>`) +
      rows.map(r => `<div class="card"><b>${esc(r.title || r.name)}</b>
        <button data-edit="${r.id}">Edit</button><button class="red" data-del="${r.id}">Delete</button></div>`).join("");

    $("#clearBtn").onclick = () => show(t);
    $("#saveBtn").onclick = async () => {
      const data = {};
      fields.forEach(([k]) => { const v = $("#f_" + k).value.trim(); data[k] = NUM.includes(k) ? Number(v) || 0 : v; });
      if (editId) await setDoc(doc(db, t, editId), data); else await addDoc(collection(db, t), data);
      show(t);
    };
    box.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => {
      const r = rows.find(x => x.id === b.dataset.edit);
      editId = r.id;
      fields.forEach(([k]) => $("#f_" + k).value = r[k] ?? "");
      $("#saveBtn").textContent = "Update";
      scrollTo({ top: 0, behavior: "smooth" });
    });
    if ($("#seed")) $("#seed").onclick = async e => {
      e.target.disabled = true;
      e.target.textContent = "Importing...";
      for (const d of DEFAULTS[t]) await addDoc(collection(db, t), d);
      show(t);
    };
  }

  box.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (confirm("Delete?")) { await deleteDoc(doc(db, t, b.dataset.del)); show(t); }
  });
}