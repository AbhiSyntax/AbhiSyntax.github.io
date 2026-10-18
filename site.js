import { db } from "./firebase-config.js";
import { collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function load(name) {
  try {
    const s = await getDocs(collection(db, name));
    return s.docs.map(d => d.data()).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch { return []; }
}

(async () => {
  // If Firestore is empty or fails, the original static HTML stays as it is.
  const skills = await load("skills");
  if (skills.length) document.getElementById("skillsBox").innerHTML = skills.map(s => `
    <div class="skill-card">
      <div class="skill-top">
        <i class="${esc(s.icon)}"></i>
        <h3>${esc(s.name)}</h3>
        <div class="percent-circle"><span>${Number(s.percent) || 0}%</span></div>
      </div>
      <div class="progress-bar"><div class="progress" style="width:${Number(s.percent) || 0}%"></div></div>
    </div>`).join("");

  const projects = await load("projects");
  if (projects.length) document.getElementById("projectsBox").innerHTML = projects.map(p => `
    <div class="portfolio-box">
      <img src="${esc(p.image)}" alt="${esc(p.title)}">
      <div class="portfolio-layer">
        <h4>${esc(p.title)}</h4>
        <p>${esc(p.desc)}</p>
        <a href="${esc(p.link || "#")}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i></a>
      </div>
    </div>`).join("");
})();

const f = document.getElementById("contactForm");
f.addEventListener("submit", async e => {
  e.preventDefault();
  const d = new FormData(f);
  try {
    await addDoc(collection(db, "messages"), {
      name: d.get("name"), email: d.get("email"), subject: d.get("subject") || "",
      message: d.get("message"), createdAt: serverTimestamp()
    });
    f.reset();
    alert("Message sent! Thank you.");
  } catch { alert("Sorry, message could not be sent. Please email me directly."); }
});