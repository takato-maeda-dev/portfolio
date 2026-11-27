/* =========================================================
 * Supabase 設定（ここを自分のプロジェクトの値に書き換えてください）
 * ========================================================= */
const SUPABASE_URL = "https://bqgyzceftjuqrhvzfysf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zFwiJA4fkqi1rzotu3ve5A_4CZObOmR";
const STORAGE_BUCKET = "portfolio-media";

/* =========================================================
 * 基本設定・フォールバック作品データ
 *  ※ Supabase未設定時のみ下の worksData が表示されます
 * ========================================================= */
const WEBGL_PATH = "./webgl/index.html";

const worksData = [
  {
    title: "[チーム制作のゲームタイトル]",
    category: "main",
    dev_period: "3ヶ月 / チーム制作",
    media: "./assets/work1.png",
    webgl_url: "",
    description:
      "[チーム制作ゲームの概要を1〜2文で記入。操作感やゲームループの特徴など]",
    tags: ["Unity 6", "C#", "Input System", "DOTween", "UniTask"],
    role: "2年次 チーム制作（メインプログラマー）\n担当: プレイヤー制御・コアシステム全般（約8〜9割）",
    architecture:
      "メインプログラマーとしてプレイヤー制御とコアシステムの約8〜9割を実装。単一責任の原則を意識したクラス分割と、インターフェース・ScriptableObjectを用いた疎結合設計を徹底し、TGS出展に向けた安定稼働を実現しました。",
  },
  {
    title: "[2Dパズルゲームのタイトル]",
    category: "rapid",
    dev_period: "1週間 / 個人制作",
    media: "./assets/work2.png",
    webgl_url: "",
    description:
      "[2Dパズルゲームの概要を1〜2文で記入。盤面操作や合成ルールの特徴など]",
    tags: ["Unity", "C#", "ScriptableObject", "2D配列"],
    role: "2年次 個人制作\n担当: 企画・プログラム・データ設計全般",
    architecture:
      "盤面の配置と合成判定を二次元配列で一元管理するパズルシステムを構築。合成ルールやパラメータをScriptableObjectに分離し、コード変更なしでギミックを追加できるデータ駆動設計を取り入れています。",
  },
  {
    title: "【Tech Demo】3Dベクトル演算による敵ロックオン制御",
    category: "tech_demo",
    dev_period: "3日 / 個人実装",
    media: "./assets/tech1.mp4",
    webgl_url: "",
    description:
      "3Dアクションゲームを想定し、視野角判定と左右ターゲット切り替えをベクトル演算で実装した技術デモです。",
    tags: ["Unity", "C#", "3D線形代数", "Input System"],
    role: "2年次 個人実装（機能検証）\n担当: ロックオンアルゴリズム・入力制御",
    architecture:
      "便利関数に頼らず3D空間の数学的処理を自力で制御するため実装。正面ベクトルと対象への単位ベクトルの内積から視野角を判定し、外積で左右の回転方向とターゲット切り替え優先度を算出しています。",
  },
  {
    title: "【Tech Demo】C++ / DirectX 12 基礎描画パイプライン",
    category: "tech_demo",
    dev_period: "継続学習 / 個人実装",
    media: "./assets/tech2.png",
    webgl_url: "",
    description:
      "ゲームエンジンを使わず、C++とDirectX 12でGPU描画パイプラインの基礎を構築した技術デモです。",
    tags: ["C++", "DirectX 12", "HLSL", "Visual Studio"],
    role: "2年次〜継続学習（個人実装）\n担当: 描画パイプライン・シェーダー実装",
    architecture:
      "エンジン内部の描画仕組みを低レイヤーから理解するため、DirectX 12のレンダリングパイプラインをゼロから構築。頂点バッファ生成、HLSLシェーダーコンパイル、PSO設定などGPU制御フローを検証しながら実装しています。",
  },
];

const CATEGORIES = [
  { key: "main", title: "Main Projects", sub: "代表作・主力作品", compact: false },
  { key: "tech_demo", title: "Tech Demos / Mechanics", sub: "技術検証・単機能実装", compact: true },
  { key: "rapid", title: "Rapid Prototypes / 1-Week Games", sub: "短期制作", compact: true },
];

/* ---------- 以下は基本的に編集不要 ---------- */

const SMALL_MQ = window.matchMedia("(max-width: 768px)");
const isSupabaseConfigured =
  /^https?:\/\//.test(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
  typeof window.supabase !== "undefined";

const sb = isSupabaseConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let currentUser = null;
let currentWorks = [...worksData];
let activeWork = null;
let activeTag = "ALL";

function workKey(w) {
  return String(w.id ?? w.title ?? "");
}

// 安全にテキストを入れるためのヘルパー
function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

// iframe内（同一オリジン）のUnity WebGLを枠にぴったり収めるCSSを注入
function fitWebGLIframe(iframe) {
  try {
    const doc = iframe.contentDocument;
    if (!doc || !doc.head || doc.getElementById("portfolio-webgl-fit")) return;
    const style = doc.createElement("style");
    style.id = "portfolio-webgl-fit";
    style.textContent = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        background: #000 !important;
      }
      #unity-container,
      #unity-container.unity-desktop,
      #unity-container.unity-mobile {
        position: fixed !important;
        inset: 0 !important;
        left: 0 !important;
        top: 0 !important;
        transform: none !important;
        width: 100% !important;
        height: 100% !important;
      }
      #unity-canvas {
        width: 100% !important;
        height: 100% !important;
        display: block !important;
      }
      #unity-footer {
        position: absolute !important;
        right: 10px !important;
        bottom: 10px !important;
        z-index: 10 !important;
        height: auto !important;
      }
      #unity-logo-title-footer,
      #unity-build-title {
        display: none !important;
      }
    `;
    doc.head.appendChild(style);
  } catch {
    // クロスオリジン時は無視
  }
}

// 選択中作品のメディア/WebGL表示を切り替え（未展開・スマホ幅ではiframe破棄）
function updateGame(forceReload = false) {
  const frame = document.getElementById("gameFrame");
  const mobileDemo = document.getElementById("mobileDemo");
  const detailMedia = document.getElementById("detailMedia");
  const controlsGuide = document.getElementById("controlsGuide");
  const existing = frame.querySelector("iframe");
  const video = mobileDemo ? mobileDemo.querySelector("video") : null;

  if (!activeWork) {
    if (existing) existing.remove();
    if (video) video.pause();
    if (detailMedia) detailMedia.innerHTML = "";
    return;
  }

  const hasWebGL = Boolean(activeWork.webgl_url);

  if (!hasWebGL) {
    // WebGL未設定の作品：画像または動画を大きく表示
    if (existing) existing.remove();
    if (video) video.pause();
    frame.hidden = true;
    mobileDemo.hidden = true;
    controlsGuide.hidden = true;
    detailMedia.hidden = false;
    if (forceReload || !detailMedia.firstChild) {
      detailMedia.innerHTML = "";
      const m = createMediaEl(activeWork.media, activeWork.title, "detail-media-item");
      if (m.tagName === "VIDEO") m.controls = true;
      detailMedia.appendChild(m);
    }
    return;
  }

  // WebGLありの作品：PCではiframe、スマホでは動画＋案内バッジ
  detailMedia.hidden = true;
  detailMedia.innerHTML = "";
  controlsGuide.hidden = false;

  if (SMALL_MQ.matches) {
    if (existing) existing.remove();
    frame.hidden = true;
    mobileDemo.hidden = false;
  } else {
    frame.hidden = false;
    mobileDemo.hidden = true;
    if (existing && forceReload) existing.remove();
    if (!frame.querySelector("iframe")) {
      const iframe = document.createElement("iframe");
      iframe.src = activeWork.webgl_url;
      iframe.title = (activeWork.title || "Unity WebGL") + " プレイ画面";
      iframe.scrolling = "no";
      iframe.allowFullscreen = true;
      iframe.setAttribute("allow", "fullscreen; autoplay; gamepad");
      iframe.addEventListener("load", () => fitWebGLIframe(iframe));
      frame.appendChild(iframe);
    }
    if (video) video.pause();
  }
}

function openPlayArea(work) {
  if (!work) return;
  activeWork = work;

  const playSection = document.getElementById("play");
  document.getElementById("playTitle").textContent = work.title || "作品詳細・プレイ";

  // 詳細パネルへテキスト・タグを反映
  const periodEl = document.getElementById("detailPeriod");
  const descEl = document.getElementById("detailDescription");
  const tagsEl = document.getElementById("detailTags");
  const introEl = document.getElementById("detailIntro");
  periodEl.textContent = work.dev_period || "";
  periodEl.hidden = !work.dev_period;
  descEl.textContent = work.description || "";
  descEl.hidden = !work.description;
  tagsEl.innerHTML = "";
  const hasTags = Array.isArray(work.tags) && work.tags.length > 0;
  if (hasTags) {
    work.tags.forEach((t) => tagsEl.appendChild(el("span", "tag", t)));
  }
  tagsEl.hidden = !hasTags;
  introEl.hidden = !work.dev_period && !work.description && !hasTags;

  document.getElementById("detailRole").textContent = work.role || "";
  document.getElementById("detailArchitecture").textContent = work.architecture || "";

  // スマホ用動画も該当作品に動画メディアがあれば差し替え、なければ既定デモ動画
  const mobileVideo = document.querySelector("#mobileDemo video");
  if (mobileVideo) {
    const isVideoMedia = /\.(mp4|webm|ogv)(\?.*)?$/i.test(work.media || "");
    const nextSrc = isVideoMedia ? work.media : "./assets/demo.mp4";
    if (mobileVideo.getAttribute("src") !== nextSrc) {
      mobileVideo.setAttribute("src", nextSrc);
      mobileVideo.load();
    }
  }

  playSection.hidden = false;
  updateGame(true);
  renderOtherWorks();
  playSection.scrollIntoView({ behavior: "smooth" });
}

function closePlayArea() {
  activeWork = null;
  document.getElementById("play").hidden = true;
  document.getElementById("otherWorksSection").hidden = true;
  updateGame(true);
}

function createMediaEl(src, title, className) {
  if (/\.(mp4|webm|ogv)(\?.*)?$/i.test(src || "")) {
    const video = el("video", className);
    video.src = src;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    return video;
  }
  const img = el("img", className);
  img.src = src || "";
  img.alt = (title || "作品") + " のスクリーンショット";
  img.loading = "lazy";
  return img;
}

function renderOtherWorks() {
  const section = document.getElementById("otherWorksSection");
  const row = document.getElementById("otherWorksRow");
  row.innerHTML = "";

  if (!activeWork) {
    section.hidden = true;
    return;
  }

  const activeKey = workKey(activeWork);
  const others = currentWorks.filter((w) => workKey(w) !== activeKey);
  if (others.length === 0) {
    section.hidden = true;
    return;
  }

  others.forEach((w) => {
    const item = el("button", "other-card");
    item.type = "button";

    const wrap = el("div", "other-card-media-wrap");
    wrap.appendChild(createMediaEl(w.media, w.title, "other-card-media"));
    if (w.webgl_url) {
      wrap.appendChild(el("span", "other-card-badge", "▶ PLAY"));
    }
    item.appendChild(wrap);

    const body = el("div", "other-card-body");
    body.appendChild(el("span", "other-card-title", w.title || ""));
    if (Array.isArray(w.tags) && w.tags.length) {
      const tags = el("div", "tags");
      w.tags.slice(0, 4).forEach((t) => tags.appendChild(el("span", "tag", t)));
      body.appendChild(tags);
    }
    item.appendChild(body);

    item.addEventListener("click", () => openPlayArea(w));

    row.appendChild(item);
  });

  section.hidden = false;
}

function renderTagFilter() {
  const container = document.getElementById("tagFilter");
  container.innerHTML = "";

  const tagSet = new Set();
  currentWorks.forEach((w) => {
    if (Array.isArray(w.tags)) {
      w.tags.forEach((t) => {
        const clean = String(t).trim();
        if (clean) tagSet.add(clean);
      });
    }
  });

  const tags = Array.from(tagSet);
  if (activeTag !== "ALL" && !tagSet.has(activeTag)) {
    activeTag = "ALL";
  }

  if (tags.length === 0) {
    container.hidden = true;
    return;
  }
  container.hidden = false;

  const makeBtn = (label, value) => {
    const btn = el("button", "filter-btn" + (activeTag === value ? " is-active" : ""), label);
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(activeTag === value));
    btn.addEventListener("click", () => {
      activeTag = value;
      renderTagFilter();
      renderWorks();
    });
    return btn;
  };

  container.appendChild(makeBtn("すべて", "ALL"));
  tags.forEach((t) => container.appendChild(makeBtn(t, t)));
}

function normalizeCategory(cat) {
  return CATEGORIES.some((c) => c.key === cat) ? cat : "main";
}

function buildAdminBar(w) {
  const bar = el("div", "card-admin-bar");
  const editBtn = el("button", "btn-secondary", "編集");
  editBtn.type = "button";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openWorkModal(w);
  });

  const delBtn = el("button", "btn-danger", "削除");
  delBtn.type = "button";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteWork(w);
  });

  bar.appendChild(editBtn);
  bar.appendChild(delBtn);
  return bar;
}

function buildMainCard(w, isAdmin) {
  const card = el("article", "card");
  card.dataset.workKey = workKey(w);

  // ① メディア
  const mediaWrap = el("div", "card-media-wrap");
  mediaWrap.appendChild(createMediaEl(w.media, w.title, "card-media"));
  mediaWrap.style.cursor = "pointer";
  mediaWrap.addEventListener("click", () => openPlayArea(w));
  card.appendChild(mediaWrap);

  const body = el("div", "card-body");

  // ② タイトル・制作期間・タグ・概要
  const intro = el("div", "block block-desc");
  intro.appendChild(el("h3", "card-title", w.title));
  if (w.dev_period) intro.appendChild(el("p", "card-period", w.dev_period));
  if (Array.isArray(w.tags) && w.tags.length) {
    const tags = el("div", "tags");
    w.tags.forEach((t) => tags.appendChild(el("span", "tag", t)));
    intro.appendChild(tags);
  }
  if (w.description) intro.appendChild(el("p", "block-text", w.description));
  body.appendChild(intro);

  // ③ 担当箇所
  const role = el("div", "block block-role");
  role.appendChild(el("h4", "block-label", "担当箇所"));
  role.appendChild(el("p", "block-text", w.role || ""));
  body.appendChild(role);

  // プレイ・詳細展開ボタン
  const actionBar = el("div", "card-action-bar");
  const detailBtn = el(
    "button",
    "card-play-btn",
    w.webgl_url ? "▶ プレイ・技術解説を見る" : "▶ 作品・技術解説を見る"
  );
  detailBtn.type = "button";
  detailBtn.addEventListener("click", () => openPlayArea(w));
  actionBar.appendChild(detailBtn);
  body.appendChild(actionBar);

  if (isAdmin && w.id) body.appendChild(buildAdminBar(w));

  card.appendChild(body);
  return card;
}

function buildCompactCard(w, isAdmin) {
  const card = el("article", "card card-compact");
  card.dataset.workKey = workKey(w);
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${w.title || "作品"} の詳細を開く`);
  card.addEventListener("click", () => openPlayArea(w));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPlayArea(w);
    }
  });

  // サムネイル（WebGLありならバッジ表示）
  const mediaWrap = el("div", "card-media-wrap");
  mediaWrap.appendChild(createMediaEl(w.media, w.title, "card-media"));
  if (w.webgl_url) {
    mediaWrap.appendChild(el("span", "other-card-badge", "▶ PLAY"));
  }
  card.appendChild(mediaWrap);

  const body = el("div", "card-body");

  // タイトル・制作期間・技術タグのみに絞って表示
  const intro = el("div", "block block-desc");
  intro.appendChild(el("h3", "card-title", w.title));
  if (w.dev_period) intro.appendChild(el("p", "card-period", w.dev_period));
  if (Array.isArray(w.tags) && w.tags.length) {
    const tags = el("div", "tags");
    w.tags.forEach((t) => tags.appendChild(el("span", "tag", t)));
    intro.appendChild(tags);
  }
  body.appendChild(intro);

  if (isAdmin && w.id) body.appendChild(buildAdminBar(w));

  card.appendChild(body);
  return card;
}

function renderWorks() {
  const container = document.getElementById("worksSections");
  container.innerHTML = "";
  const isAdmin = Boolean(currentUser);

  const filtered =
    activeTag === "ALL"
      ? currentWorks
      : currentWorks.filter(
          (w) => Array.isArray(w.tags) && w.tags.includes(activeTag)
        );

  let renderedAny = false;

  CATEGORIES.forEach((cat) => {
    const items = filtered.filter((w) => normalizeCategory(w.category) === cat.key);
    if (items.length === 0) return;

    renderedAny = true;
    const sec = el("div", "category-section");
    sec.id = `category-${cat.key}`;

    const head = el("div", "category-head");
    const title = el("h3", "category-title");
    title.appendChild(document.createTextNode(cat.title));
    title.appendChild(el("span", "category-sub", cat.sub));
    head.appendChild(title);
    head.appendChild(el("span", "category-count", `${items.length}件`));
    sec.appendChild(head);

    const grid = el("div", cat.compact ? "works-grid-compact" : "works-grid");
    items.forEach((w) => {
      grid.appendChild(cat.compact ? buildCompactCard(w, isAdmin) : buildMainCard(w, isAdmin));
    });
    sec.appendChild(grid);
    container.appendChild(sec);
  });

  if (!renderedAny) {
    container.appendChild(
      el("p", "works-empty", "該当する作品がありません。")
    );
  }
}

/* ---------- Supabase データ取得・認証・CRUD ---------- */

async function loadWorks() {
  if (!sb) {
    currentWorks = [...worksData];
    renderTagFilter();
    renderWorks();
    if (activeWork) renderOtherWorks();
    return;
  }
  const { data, error } = await sb
    .from("works")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("works 取得エラー:", error.message);
    currentWorks = [...worksData];
  } else if (data && data.length > 0) {
    currentWorks = data;
  } else {
    currentWorks = currentUser ? [] : [...worksData];
  }
  renderTagFilter();
  renderWorks();
  if (activeWork) renderOtherWorks();
}

function syncAdminUI() {
  const isAdmin = Boolean(currentUser);
  document.getElementById("addWorkBtn").hidden = !isAdmin;
  document.getElementById("logoutBtn").hidden = !isAdmin;
  document.getElementById("adminTrigger").hidden = isAdmin;
  renderWorks();
}

function openModal(id) {
  document.getElementById(id).hidden = false;
}

function closeModal(id) {
  document.getElementById(id).hidden = true;
}

function openWorkModal(work = null) {
  document.getElementById("workMsg").textContent = "";
  document.getElementById("workMediaFile").value = "";
  if (work) {
    document.getElementById("workModalTitle").textContent = "作品を編集";
    document.getElementById("workId").value = work.id;
    document.getElementById("workTitle").value = work.title || "";
    document.getElementById("workCategory").value = normalizeCategory(work.category);
    document.getElementById("workDevPeriod").value = work.dev_period || "";
    document.getElementById("workMediaUrl").value = work.media || "";
    document.getElementById("workWebglUrl").value = work.webgl_url || "";
    document.getElementById("workDescription").value = work.description || "";
    document.getElementById("workRole").value = work.role || "";
    document.getElementById("workArchitecture").value = work.architecture || "";
    document.getElementById("workTags").value = Array.isArray(work.tags)
      ? work.tags.join(", ")
      : "";
  } else {
    document.getElementById("workModalTitle").textContent = "作品を追加";
    document.getElementById("workForm").reset();
    document.getElementById("workId").value = "";
  }
  openModal("workModal");
}

async function uploadMediaIfNeeded(file, existingUrl) {
  if (!file) return existingUrl;
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  const filePath = `${Date.now()}_${safeBase || "media"}.${ext}`;

  const { error } = await sb.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error("メディアのアップロードに失敗しました: " + error.message);

  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function handleSaveWork(e) {
  e.preventDefault();
  if (!sb || !currentUser) return;

  const msg = document.getElementById("workMsg");
  const submit = document.getElementById("workSubmit");
  msg.textContent = "";
  submit.disabled = true;
  submit.textContent = "保存中...";

  try {
    const id = document.getElementById("workId").value.trim();
    const file = document.getElementById("workMediaFile").files[0] || null;
    const mediaUrlInput = document.getElementById("workMediaUrl").value.trim();
    const media = await uploadMediaIfNeeded(file, mediaUrlInput);

    const tagsRaw = document.getElementById("workTags").value.trim();
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: document.getElementById("workTitle").value.trim(),
      category: document.getElementById("workCategory").value || "main",
      dev_period: document.getElementById("workDevPeriod").value.trim(),
      media,
      webgl_url: document.getElementById("workWebglUrl").value.trim(),
      description: document.getElementById("workDescription").value.trim(),
      role: document.getElementById("workRole").value.trim(),
      architecture: document.getElementById("workArchitecture").value.trim(),
      tags,
    };

    const query = id
      ? sb.from("works").update(payload).eq("id", id)
      : sb.from("works").insert(payload);

    const { error } = await query;
    if (error) throw error;

    closeModal("workModal");
    await loadWorks();
  } catch (err) {
    msg.textContent = err.message || "保存に失敗しました。";
  } finally {
    submit.disabled = false;
    submit.textContent = "保存する";
  }
}

async function deleteWork(work) {
  if (!sb || !currentUser || !work.id) return;
  if (!window.confirm(`「${work.title}」を削除しますか？`)) return;

  const { error } = await sb.from("works").delete().eq("id", work.id);
  if (error) {
    alert("削除に失敗しました: " + error.message);
    return;
  }
  await loadWorks();
}

async function handleLogin(e) {
  e.preventDefault();
  const msg = document.getElementById("loginMsg");
  msg.textContent = "";

  if (!sb) {
    msg.textContent =
      "script.js 先頭の SUPABASE_URL と SUPABASE_ANON_KEY を設定してください。";
    return;
  }

  const submit = document.getElementById("loginSubmit");
  submit.disabled = true;
  submit.textContent = "ログイン中...";

  try {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    document.getElementById("loginForm").reset();
    closeModal("loginModal");
  } catch (err) {
    msg.textContent = "ログインに失敗しました: " + (err.message || "");
  } finally {
    submit.disabled = false;
    submit.textContent = "ログイン";
  }
}

/* ---------- イベント登録・初期化 ---------- */

document.getElementById("adminTrigger").addEventListener("click", () => {
  document.getElementById("loginMsg").textContent = sb
    ? ""
    : "script.js 先頭の SUPABASE_URL と SUPABASE_ANON_KEY を設定してください。";
  openModal("loginModal");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  if (sb) await sb.auth.signOut();
});

document.getElementById("addWorkBtn").addEventListener("click", () => {
  openWorkModal(null);
});

document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("workForm").addEventListener("submit", handleSaveWork);

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.hidden = true;
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal("loginModal");
    closeModal("workModal");
  }
});

document.getElementById("closePlayBtn").addEventListener("click", closePlayArea);

document.getElementById("year").textContent = new Date().getFullYear();
SMALL_MQ.addEventListener("change", () => updateGame(false));

(async function init() {
  if (sb) {
    const { data } = await sb.auth.getSession();
    currentUser = data?.session?.user || null;
    syncAdminUI();
    sb.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
      syncAdminUI();
      loadWorks();
    });
  } else {
    syncAdminUI();
  }
  await loadWorks();
})();
