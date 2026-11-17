/* RTB Transportation — site interactions */

/* ------------------------------------------------------------------
   ESTIMATE FORM DELIVERY
   Paste a form endpoint here to have submissions emailed to RTB
   (e.g. a Formspree URL "https://formspree.io/f/xxxxxxx" or
   Web3Forms "https://api.web3forms.com/submit" + WEB3FORMS_KEY).
   Until one is set, the form opens a pre-filled text message to
   (775) 440-8545 so no request is ever lost.
------------------------------------------------------------------- */
const FORM_ENDPOINT = "";
const WEB3FORMS_KEY = "";
const RTB_PHONE = "+17754408545";

// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Sticky nav style
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 70}ms`;
  io.observe(el);
});

// Count-up stat
document.querySelectorAll("[data-count]").forEach((el) => {
  const target = +el.dataset.count;
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + "+";
    };
    requestAnimationFrame(step);
  });
  obs.observe(el);
});

// Only one reel plays at a time
const reels = document.querySelectorAll(".reel video");
reels.forEach((v) =>
  v.addEventListener("play", () => reels.forEach((o) => o !== v && o.pause()))
);

// Don't allow past dates
const dateInput = document.querySelector('input[name="date"]');
if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

// Estimate form
const form = document.getElementById("estimateForm");
const status = document.getElementById("formStatus");

function collect() {
  const fd = new FormData(form);
  return {
    name: fd.get("name").trim(),
    phone: fd.get("phone").trim(),
    email: fd.get("email").trim(),
    customer: fd.get("customer"),
    service: fd.get("service"),
    materials: fd.getAll("materials").join(", "),
    quantity: fd.get("quantity").trim(),
    date: fd.get("date"),
    address: fd.get("address").trim(),
    details: fd.get("details").trim(),
  };
}

function summary(d) {
  return [
    "RTB Estimate Request",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    d.email && `Email: ${d.email}`,
    `Customer: ${d.customer}`,
    `Service: ${d.service}`,
    d.materials && `Materials: ${d.materials}`,
    d.quantity && `Quantity: ${d.quantity}`,
    d.date && `Preferred date: ${d.date}`,
    `Job site: ${d.address}`,
    d.details && `Details: ${d.details}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function validate() {
  let ok = true;
  form.querySelectorAll("[required]").forEach((f) => {
    const bad = !f.value.trim();
    f.classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  const phone = form.phone.value.replace(/\D/g, "");
  if (phone.length < 10) {
    form.phone.classList.add("invalid");
    ok = false;
  }
  return ok;
}

form.querySelectorAll("input, select").forEach((f) =>
  f.addEventListener("input", () => f.classList.remove("invalid"))
);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.className = "form__status";
  status.innerHTML = "";

  if (!validate()) {
    status.className = "form__status err";
    status.textContent = "Please fill in your name, a valid phone number, the service and the job site address.";
    return;
  }

  const data = collect();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Sending…";

  if (FORM_ENDPOINT) {
    try {
      const payload = WEB3FORMS_KEY
        ? { access_key: WEB3FORMS_KEY, subject: `New estimate request — ${data.name}`, ...data }
        : { _subject: `New estimate request — ${data.name}`, ...data };
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("bad response");
      status.className = "form__status ok";
      status.innerHTML = `<strong>Thanks, ${escapeHtml(data.name.split(" ")[0])}!</strong> Your estimate request was sent. RTB will reach out shortly. Need it sooner? Call or text <a href="tel:${RTB_PHONE}">(775) 440-8545</a>.`;
      form.reset();
    } catch {
      showTextFallback(data, true);
    }
  } else {
    showTextFallback(data, false);
  }

  btn.disabled = false;
  btn.textContent = "Send Estimate Request";
});

function showTextFallback(data, failed) {
  const body = summary(data);
  const sep = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent) ? "&" : "?";
  const smsHref = `sms:${RTB_PHONE}${sep}body=${encodeURIComponent(body)}`;
  status.className = "form__status ok";
  status.innerHTML = `
    <strong>${failed ? "Almost there!" : "Your request is ready to send!"}</strong>
    Tap below to text it straight to RTB, or call <a href="tel:${RTB_PHONE}">(775) 440-8545</a>.
    <br/><a class="btn btn--blue" href="${smsHref}">Text My Request to RTB</a>
    <button type="button" class="btn btn--ghost" id="copyReq">Copy Details</button>`;
  document.getElementById("copyReq").addEventListener("click", async (ev) => {
    try {
      await navigator.clipboard.writeText(body);
      ev.target.textContent = "Copied!";
    } catch {
      ev.target.textContent = "Copy failed";
    }
  });
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) window.location.href = smsHref;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
