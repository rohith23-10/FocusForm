import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";

const $ = (id) => document.getElementById(id);
const KEY = "focusform_data_v1";
const API_URL = "https://focusform-ar89.onrender.com";
let lastPostureSave = 0;

/* ---------- STORAGE ---------- */
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { days: {} }; } catch { return { days: {} }; } };
let store = load();
const save = () => localStorage.setItem(KEY, JSON.stringify(store));
const dayKey = (d = new Date()) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD local
function today() {
  const k = dayKey();
  if (!store.days[k]) store.days[k] = { focusSec: 0, sessions: 0, goodSec: 0, badSec: 0, scoreSum: 0, scoreTime: 0, hours: {} };
  return store.days[k];
}

/* ---------- HELPERS ---------- */
function toast(msg, ms = 5000) {
  const t = $("toast"); t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add("hidden"), ms);
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.frequency.value = 660; g.gain.value = 0.08;
    o.start(); o.stop(ctx.currentTime + 0.25);
  } catch {}
}
function speak(text) {
  if (!$("voiceOn").checked || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[–—]/g, ","));
  u.rate = 0.95; speechSynthesis.speak(u);
}
function notify(title, body) {
  beep(); speak(body); toast(title + " – " + body);
  if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body });
}
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

async function saveFocusSession(duration, sessionType) {
  try {
    const response = await fetch(`${API_URL}/api/focus-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        duration: duration,
        session_type: sessionType
      })
    });

    if (!response.ok) {
      throw new Error("Could not save focus session");
    }

    console.log("Focus session saved to database!");
  } catch (error) {
    console.error("Backend connection error:", error);
  }
}
async function savePostureScore(score, status) {
  try {
    const response = await fetch(`${API_URL}/api/posture-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        posture_score: Math.round(score),
        status: status
      })
    });

    if (!response.ok) {
      throw new Error("Could not save posture score");
    }

    console.log("Posture score saved to database!");
  } catch (error) {
    console.error("Posture database error:", error);
  }
}

/* ---------- NAV ---------- */
document.querySelectorAll(".nav").forEach((b) => b.onclick = () => {
  document.querySelectorAll(".nav").forEach((x) => x.classList.remove("active")); b.classList.add("active");
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  $(b.dataset.view).classList.remove("hidden");
  renderAnalytics();
});

/* ---------- FOCUS TIMER ---------- */
let mode = "focus", total = 25 * 60, left = total, running = false, last = 0;
function setMode(m) {
  mode = m;
  total = (m === "focus" ? +$("focusMin").value : +$("breakMin").value) * 60;
  left = total; running = false;
  $("modeLabel").textContent = m === "focus" ? "Focus" : "Break – stretch & rest your eyes";
  drawTimer();
}
function drawTimer() {
  $("timer").textContent = fmt(left);
  $("timerBar").style.width = (100 * (1 - left / total)) + "%";
}
$("startBtn").onclick = () => {
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  if (!running) { running = true; last = performance.now(); }
};
$("pauseBtn").onclick = () => running = false;
$("resetBtn").onclick = () => setMode("focus");
$("focusMin").onchange = () => mode === "focus" && !running && setMode("focus");
$("breakMin").onchange = () => mode === "break" && !running && setMode("break");

setInterval(() => {
  if (!running) return;
  const now = performance.now(), dt = (now - last) / 1000; last = now;
  left -= dt;
  if (mode === "focus") {
    const d = today(), h = new Date().getHours();
    d.focusSec += dt; d.hours[h] = (d.hours[h] || 0) + dt;
  }
  if (left <= 0) {
    if (mode === "focus") {
      today().sessions += 1; save();

      saveFocusSession(Math.round(total / 60), "focus");
      
      notify("Focus session done! 🎉", "Time for a short break. Stand up and stretch.");
      setMode("break"); running = true; last = performance.now();
    } else {
      notify("Break over", "Ready for the next focus session?");
      setMode("focus");
    }
  }
  drawTimer();
}, 250);
setInterval(save, 5000);
setMode("focus");

/* ---------- POSTURE ---------- */
let landmarker = null, stream = null, baseline = null, calibrating = null;
let loopTimer = null;
let smooth = null, badFor = 0, lastAlert = 0, lastVideoTime = -1, lastTick = 0;
const video = $("video"), canvas = $("overlay"), ctx2 = canvas.getContext("2d");

async function initModel() {
  $("camStatus").textContent = "Loading the posture model (first time takes a few seconds)…";
  const fileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
  landmarker = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task", delegate: "GPU" },
    runningMode: "VIDEO", numPoses: 1,
  });
}

$("camBtn").onclick = async () => {
  if (stream) { stopCamera(); return; }
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  try {
    if (!landmarker) await initModel();
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream; await video.play();
    $("camPlaceholder").classList.add("hidden");
    $("camBtn").textContent = "Stop camera"; $("calBtn").disabled = false;
    $("camStatus").textContent = "Camera on. Sit straight and press Calibrate.";
    lastTick = performance.now(); clearInterval(loopTimer); loopTimer = setInterval(loop, 150);
  } catch (e) {
    console.error(e);
    $("camStatus").textContent = "Could not start camera: " + e.message + ". Allow camera access and open the app at http://localhost:8000";
  }
};
function stopCamera() {
  clearInterval(loopTimer); document.title = "FocusForm – Sit Better. Focus Smarter.";
  stream.getTracks().forEach((t) => t.stop()); stream = null; video.srcObject = null;
  $("camPlaceholder").classList.remove("hidden"); $("camBtn").textContent = "Start camera";
  $("calBtn").disabled = true; setScore(null); ctx2.clearRect(0, 0, canvas.width, canvas.height);
}
$("calBtn").onclick = () => { calibrating = { samples: [], until: performance.now() + 2000 }; $("hint").textContent = "Calibrating… sit tall and hold still for 2 seconds."; };

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function metrics(lm) {
  const ls = lm[11], rs = lm[12], le = lm[7], re = lm[8];
  if ([ls, rs, le, re].some((p) => (p.visibility ?? 1) < 0.4)) return null;
  const sw = dist(ls, rs); if (sw < 0.08) return { far: true };
  const shMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 }, eMid = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
  return {
    sw,
    neck: (shMid.y - eMid.y) / sw,
    lean: Math.abs(eMid.x - shMid.x) / sw,
    tilt: Math.abs(Math.atan2(rs.y - ls.y, rs.x - ls.x) * 180 / Math.PI),
  };
}
function scoreOf(m) {
  const b = baseline;
  const slouch = Math.max(0, (b.neck - m.neck) / b.neck);          // head sinking toward shoulders
  const lean = Math.max(0, m.lean - b.lean - 0.05);                // head drifting sideways
  const tilt = Math.max(0, Math.min(Math.abs(m.tilt - b.tilt), 90) - 3); // uneven shoulders
  const close = Math.max(0, m.sw / b.sw - 1.15);                   // leaning in to the screen
  const pen = { slouch: slouch * 220, lean: lean * 120, tilt: tilt * 3, close: close * 150 };
  const score = Math.max(0, Math.min(100, 100 - (pen.slouch + pen.lean + pen.tilt + pen.close)));
  const worst = Object.entries(pen).sort((a, b) => b[1] - a[1])[0];
  const msgs = { slouch: "You are slouching – lift your chest and chin.", lean: "Your head is leaning to one side – center it.", tilt: "Your shoulders are uneven – relax and level them.", close: "You are too close to the screen – sit back a little." };
  return { score, tip: worst[1] > 5 ? msgs[worst[0]] : "Great posture! Keep it up." };
}
function setScore(s, label, tip) {
  const fg = $("ringFg");
  if (s == null) { $("scoreNum").textContent = "--"; $("scoreLabel").textContent = "camera off"; fg.style.strokeDashoffset = 326.7; return; }
  $("scoreNum").textContent = Math.round(s);
  $("scoreLabel").textContent = label;
  fg.style.strokeDashoffset = 326.7 * (1 - s / 100);
  fg.style.stroke = label === "good" ? "#7a9e7e" : "#d98b6a";
  if (tip) $("hint").textContent = tip;
}
function draw(lm) {
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  const pts = [7, 8, 11, 12].map((i) => lm[i]); const P = (p) => [p.x * canvas.width, p.y * canvas.height];
  ctx2.strokeStyle = "#7a9e7e"; ctx2.lineWidth = 4; ctx2.fillStyle = "#dff3e8";
  ctx2.beginPath(); ctx2.moveTo(...P(lm[11])); ctx2.lineTo(...P(lm[12])); ctx2.stroke();
  ctx2.beginPath(); ctx2.moveTo(...P(lm[7])); ctx2.lineTo(...P(lm[8])); ctx2.stroke();
  pts.forEach((p) => { ctx2.beginPath(); ctx2.arc(...P(p), 6, 0, 7); ctx2.fill(); ctx2.stroke(); });
}

function loop() {
  if (!stream) return;
  const now = performance.now();
  if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
    lastVideoTime = video.currentTime;
    const res = landmarker.detectForVideo(video, now);
    const dt = Math.min((now - lastTick) / 1000, 0.5); lastTick = now;
    const lm = res.landmarks && res.landmarks[0];
    if (!lm) { $("hint").textContent = "I can't see you. Make sure your head and shoulders are in view."; }
    else {
      draw(lm);
      const m = metrics(lm);
      if (!m) $("hint").textContent = "Head or shoulders not clearly visible.";
      else if (m.far) $("hint").textContent = "Move a bit closer to the camera.";
      else if (calibrating) {
        calibrating.samples.push(m);
        if (now > calibrating.until && calibrating.samples.length > 5) {
          const avg = (k) => calibrating.samples.reduce((a, s) => a + s[k], 0) / calibrating.samples.length;
          baseline = { sw: avg("sw"), neck: avg("neck"), lean: avg("lean"), tilt: avg("tilt") };
          calibrating = null; toast("Calibrated! Now FocusForm watches your posture.");
        }
      } else if (!baseline) { $("hint").textContent = "Sit straight and press Calibrate."; }
      else {
        const r = scoreOf(m);
        smooth = smooth == null ? r.score : smooth * 0.85 + r.score * 0.15;
        const good = smooth >= +$("sens").value;
        setScore(smooth, good ? "good" : "slouching", r.tip);
        if (now - lastPostureSave >= 60000) {
  lastPostureSave = now;
  savePostureScore(
    smooth,
    good ? "Good" : "Needs correction"
  );
}
        // save real data
        const d = today();
        d.scoreSum += smooth * dt; d.scoreTime += dt;
        if (good) { d.goodSec += dt; badFor = 0; } else { d.badSec += dt; badFor += dt; }
        document.title = good ? "FocusForm" : "⚠ Fix your posture!";
        if (badFor > +$("alertSec").value && now - lastAlert > 20000) { lastAlert = now; badFor = 0; notify("Fix your posture ⚠", r.tip); }
      }
    }
  }
}

/* ---------- ANALYTICS & INSIGHTS ---------- */
function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); out.push({ key: dayKey(dt), label: dt.toLocaleDateString("en", { weekday: "short" }) }); }
  return out;
}
function bars(el, items, unit) {
  const max = Math.max(1, ...items.map((i) => i.value));
  el.innerHTML = items.map((i) => `<div class="col"><div class="v">${i.value ? Math.round(i.value) + (unit || "") : ""}</div><div class="b" style="height:${(i.value / max) * 100}%"></div><div>${i.label}</div></div>`).join("");
}
function insights() {
  const days = Object.entries(store.days), out = [];
  const hours = {}; days.forEach(([, d]) => Object.entries(d.hours || {}).forEach(([h, s]) => hours[h] = (hours[h] || 0) + s));
  const total = Object.values(hours).reduce((a, b) => a + b, 0);
  if (total < 300) return ["Do at least 5 minutes of focus time and your insights will appear here."];
  const best = Object.entries(hours).sort((a, b) => b[1] - a[1])[0][0];
  const f = (h) => `${((+h + 11) % 12) + 1}${+h < 12 ? "am" : "pm"}`;
  out.push(`Your best focus time is around ${f(best)}–${f(+best + 1)} (most focused minutes recorded).`);
  const t = today();
  if (t.scoreTime > 30) {
    const avg = t.scoreSum / t.scoreTime, goodPct = 100 * t.goodSec / (t.goodSec + t.badSec || 1);
    out.push(`Today your posture score averages ${Math.round(avg)} and you sat well ${Math.round(goodPct)}% of the time.`);
  }
  const withPosture = days.filter(([, d]) => d.scoreTime > 60).sort();
  if (withPosture.length >= 2) {
    const a = withPosture.at(-1)[1], b = withPosture.at(-2)[1];
    const diff = a.scoreSum / a.scoreTime - b.scoreSum / b.scoreTime;
    out.push(`Posture is ${diff >= 0 ? "up" : "down"} ${Math.abs(Math.round(diff))} points compared with your previous tracked day.`);
  }
  const mins = t.focusSec / 60;
  out.push(mins >= 120 ? "You have focused over 2 hours today – great work, remember to rest your eyes." : `You have focused ${Math.round(mins)} min today. Try a goal of 100 min.`);
  return out;
}
function renderInsights() {
  const html = insights().map((t) => `<li>${t}</li>`).join("");
  $("insightsMini").innerHTML = html; $("insights").innerHTML = html;
}
function renderAnalytics() {
  const t = today(), d7 = lastDays(7);
  $("stFocus").textContent = Math.round(t.focusSec / 60) + " min";
  $("stSessions").textContent = t.sessions;
  $("stPosture").textContent = t.scoreTime > 5 ? Math.round(t.scoreSum / t.scoreTime) : "--";
  const tt = t.goodSec + t.badSec; $("stGood").textContent = tt > 5 ? Math.round(100 * t.goodSec / tt) + "%" : "--";
  bars($("chartFocus"), d7.map((x) => ({ label: x.label, value: (store.days[x.key]?.focusSec || 0) / 60 })), "m");
  bars($("chartPosture"), d7.map((x) => { const d = store.days[x.key]; return { label: x.label, value: d && d.scoreTime > 5 ? d.scoreSum / d.scoreTime : 0 }; }));
  const hrs = {}; Object.values(store.days).forEach((d) => Object.entries(d.hours || {}).forEach(([h, s]) => hrs[h] = (hrs[h] || 0) + s));
  bars($("chartHours"), Array.from({ length: 17 }, (_, i) => ({ label: String(i + 6), value: (hrs[i + 6] || 0) / 60 })));
  renderInsights();
}
$("clearBtn").onclick = () => { if (confirm("Delete all saved FocusForm data?")) { store = { days: {} }; save(); renderAnalytics(); } };
setInterval(() => { if (!$("analytics").classList.contains("hidden")) renderAnalytics(); else renderInsights(); }, 5000);
renderAnalytics();

/* ---------- TEST ALERT ---------- */
$("testBtn").onclick = async () => {
  if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
  notify("Fix your posture ⚠", "This is a test alert. Sit straight!");
  if ("Notification" in window && Notification.permission !== "granted")
    toast("Desktop notifications are blocked. Click the lock icon next to the address bar and allow Notifications.", 8000);
};
