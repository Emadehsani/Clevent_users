const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const body = document.getElementById("peopleBody");
const count = document.getElementById("count");
const connection = document.getElementById("connection");
const lastUpdate = document.getElementById("lastUpdate");
const search = document.getElementById("search");
const message = document.getElementById("message");

const modal = document.getElementById("modal");
const confirmModal = document.getElementById("confirmModal");
const form = document.getElementById("personForm");
const modalTitle = document.getElementById("modalTitle");
const personId = document.getElementById("personId");
const nameInput = document.getElementById("name");
const positionInput = document.getElementById("position");
const passwordInput = document.getElementById("password");

let people = [];
let pendingDeleteId = null;

function setConnection(ok, text) {
  connection.className = `status ${ok ? "ok" : "error"}`;
  connection.innerHTML = `<i></i>${text}`;
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.className = `message${error ? " error" : ""}`;
  if (text) setTimeout(() => { message.classList.add("hidden"); }, 4000);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  const q = search.value.trim().toLowerCase();
  const filtered = people.filter(p =>
    String(p.name ?? "").toLowerCase().includes(q) ||
    String(p.position ?? "").toLowerCase().includes(q) ||
    String(p.id ?? "").includes(q)
  );

  count.textContent = people.length.toLocaleString("fa-IR");

  if (!filtered.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty">${people.length ? "نتیجه‌ای پیدا نشد." : "هنوز پرسنلی ثبت نشده است."}</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map(p => `
    <tr>
      <td class="id-badge">${escapeHtml(p.id)}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.position)}</td>
      <td>${p.password == null || p.password === "" ? "—" : "••••••"}</td>
      <td>
        <div class="actions">
          <button class="action" data-action="edit" data-id="${escapeHtml(p.id)}">ویرایش</button>
          <button class="action delete" data-action="delete" data-id="${escapeHtml(p.id)}">حذف</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function loadPeople() {
  body.innerHTML = `<tr><td colspan="5" class="empty">در حال دریافت اطلاعات...</td></tr>`;
  const { data, error } = await db.from(TABLE_NAME).select("id,name,position,password").order("id", { ascending: true });

  if (error) {
    setConnection(false, "خطا در اتصال");
    body.innerHTML = `<tr><td colspan="5" class="empty">دریافت اطلاعات ناموفق بود.<br><small>${escapeHtml(error.message)}</small></td></tr>`;
    return;
  }

  people = data ?? [];
  setConnection(true, "متصل به Supabase");
  lastUpdate.textContent = `آخرین بروزرسانی: ${new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`;
  render();
}

function openPersonModal(person = null) {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  modalTitle.textContent = person ? "ویرایش پرسنل" : "افزودن پرسنل";
  personId.value = person?.id ?? "";
  nameInput.value = person?.name ?? "";
  positionInput.value = person?.position ?? "";
  passwordInput.value = person?.password ?? "";
  nameInput.focus();
}

function closePersonModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  form.reset();
  personId.value = "";
}

function openDeleteModal(person) {
  pendingDeleteId = person.id;
  document.getElementById("confirmText").textContent = `آیا از حذف «${person.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`;
  confirmModal.classList.remove("hidden");
}

function closeDeleteModal() {
  confirmModal.classList.add("hidden");
  pendingDeleteId = null;
}

document.getElementById("addBtn").addEventListener("click", () => openPersonModal());
document.getElementById("closeModal").addEventListener("click", closePersonModal);
document.getElementById("cancelBtn").addEventListener("click", closePersonModal);
document.getElementById("deleteCancel").addEventListener("click", closeDeleteModal);
search.addEventListener("input", render);

document.querySelectorAll(".modal-backdrop").forEach(el => el.addEventListener("click", () => {
  if (!modal.classList.contains("hidden")) closePersonModal();
  if (!confirmModal.classList.contains("hidden")) closeDeleteModal();
}));

body.addEventListener("click", event => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const person = people.find(p => String(p.id) === String(id));
  if (!person) return;
  if (btn.dataset.action === "edit") openPersonModal(person);
  if (btn.dataset.action === "delete") openDeleteModal(person);
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  const id = personId.value.trim();
  const name = nameInput.value.trim();
  const position = positionInput.value.trim();
  const passwordRaw = passwordInput.value.trim();

  if (!name || !position) return showMessage("نام و سمت الزامی هستند.", true);

  const payload = {
    name,
    position,
    password: passwordRaw === "" ? null : Number(passwordRaw)
  };

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "در حال ذخیره...";

  let result;
  if (id) {
    result = await db.from(TABLE_NAME).update(payload).eq("id", id);
  } else {
    // Your current table uses id as the identifier. For a new record, ask Postgres
    // to generate it only if the column has an identity/default configured.
    result = await db.from(TABLE_NAME).insert(payload);
  }

  saveBtn.disabled = false;
  saveBtn.textContent = "ذخیره";

  if (result.error) {
    showMessage(`ذخیره انجام نشد: ${result.error.message}`, true);
    return;
  }

  closePersonModal();
  showMessage(id ? "اطلاعات با موفقیت ویرایش شد." : "پرسنل جدید با موفقیت اضافه شد.");
  await loadPeople();
});

document.getElementById("deleteConfirm").addEventListener("click", async () => {
  if (pendingDeleteId == null) return;
  const btn = document.getElementById("deleteConfirm");
  btn.disabled = true;
  btn.textContent = "در حال حذف...";

  const { error } = await db.from(TABLE_NAME).delete().eq("id", pendingDeleteId);

  btn.disabled = false;
  btn.textContent = "حذف";

  if (error) {
    showMessage(`حذف انجام نشد: ${error.message}`, true);
    return;
  }

  closeDeleteModal();
  showMessage("پرسنل با موفقیت حذف شد.");
  await loadPeople();
});

loadPeople();
