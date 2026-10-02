(() => {
  const VERSION = '0.3.0'
  const STYLE_ID = 'rtl-chat-style'
  const DYNAMIC_STYLE_ID = 'rtl-chat-dynamic-style'
  const BADGE_ID = 'rtl-chat-badge'
  const PANEL_ID = 'rtl-chat-settings-panel'
  const STORAGE_KEY = 'rtl_chat_settings_v1'
  const VIA = 'ext'

  const DEFAULT_SETTINGS = {
    enabled: true,
    fontFamily: 'Vazirmatn', // 'Vazirmatn', 'Shabnam', 'Sahel', 'Samim', 'Tahoma', 'System', 'Custom'
    customFont: '',
    fontSize: 15, // px (12-22)
    lineHeight: 1.75, // (1.3 - 2.4)
    persianDigits: false
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw))
    } catch (_) {}
    return Object.assign({}, DEFAULT_SETTINGS)
  }

  function saveSettings(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch (_) {}
  }

  let settings = loadSettings()

  const BASE_CSS = `
/* RTL Chat v0.3.0 — Base Layout & Direction */

[data-v4-timeline-scroll],
[data-v4-timeline-message-layer],
[data-v4-timeline-content-column],
[data-v4-timeline-virtual-history],
[data-trajectory-timeline],
[data-v4-draft-greeting],
[data-v4-draft-suggested-prompts],
[data-testid="chat-empty"] {
  direction: rtl;
}

/* User row is flex-col + items-end (bubble on the right in original LTR).
   Inherited rtl flips items-end to the left — force LTR layout only on the row.
   Text direction still comes from each bubble's own [dir]. */
[data-v4-timeline-scroll] [class*="group/user-row"] {
  direction: ltr;
}

/* Composer sits inside timeline-scroll (rtl) — restore original LTR chrome/toolbars */
[data-v4-composer-dock],
[data-v4-composer-dock-content],
[data-v4-composer-dock] form,
[data-v4-composer-dock] [class*="group/toolbar"] {
  direction: ltr !important;
}

/* Message roots: JS sets dir from first word. text-align:start follows it
   (rtl → right, ltr → left). Do NOT force direction/text-align here. */
[data-trajectory-message-role],
[data-trajectory-message-content],
[data-trajectory-expanded-content-shell],
[data-trajectory-user-content-card],
[data-v4-user-input-bubble],
[data-v4-user-input-attachments],
[data-v4-user-input-media-attachments],
[data-v4-user-input-epilogue],
[data-v4-user-input-collapsible-content],
[data-reasoning-content],
[data-trajectory-role-label],
[data-trajectory-message-actions],
[data-trajectory-call-metadata] {
  text-align: start;
}

[data-trajectory-role-label] {
  padding-right: 0 !important;
  padding-left: 0.25rem !important;
}

/* Radius flip only when that user message is actually RTL (first word Persian) */
[data-v4-user-input-bubble][dir="rtl"] {
  border-top-left-radius: 0.125rem !important;
  border-top-right-radius: 0.75rem !important;
}

/* Editor: dir set live by JS from typed first word — no blanket rtl */
[data-lexical-editor="true"] p,
[data-testid="chat-input"] p {
  text-align: start;
}

/* Placeholder pinned right only while editor itself is rtl */
[data-v4-composer-dock] [data-lexical-editor="true"][dir="rtl"] ~ .pointer-events-none,
[data-v4-composer-dock] [data-testid="chat-input"][dir="rtl"] ~ .pointer-events-none {
  left: auto !important;
  right: 0 !important;
}

[data-streamdown="code-block"],
[data-streamdown="code-block-body"],
[data-streamdown="code-block-header"],
[data-streamdown="code-block-actions"],
[data-streamdown="inline-code"],
[data-streamdown="table"],
[data-streamdown="table-wrapper"],
[data-streamdown="table-header"],
[data-streamdown="table-body"],
[data-streamdown="table-row"],
[data-streamdown="table-cell"],
[data-streamdown="table-header-cell"],
[data-streamdown="mermaid"],
[data-streamdown="mermaid-block"],
pre,
code,
kbd,
samp,
.katex,
[data-inline-diff-preview],
[data-diff-viewer],
[data-diff-span],
[data-tool-name] {
  direction: ltr !important;
  text-align: left !important;
  unicode-bidi: isolate !important;
}

/* Flip Tailwind text-left only inside an RTL message root */
[data-v4-timeline-scroll] [dir="rtl"] [class~="text-left"],
[data-v4-timeline-scroll] [class~="text-left"][dir="rtl"] {
  text-align: right !important;
}
`

  function getDynamicCss(cfg) {
    if (!cfg.enabled) {
      return `/* RTL Chat is disabled in settings */`
    }

    let fontFam = ''
    switch (cfg.fontFamily) {
      case 'Vazirmatn':
        fontFam = `'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
        break
      case 'Shabnam':
        fontFam = `'Shabnam', 'Vazirmatn', sans-serif`
        break
      case 'Sahel':
        fontFam = `'Sahel', 'Vazirmatn', sans-serif`
        break
      case 'Samim':
        fontFam = `'Samim', 'Vazirmatn', sans-serif`
        break
      case 'Tahoma':
        fontFam = `Tahoma, Arial, sans-serif`
        break
      case 'Custom':
        fontFam = cfg.customFont ? `${cfg.customFont}, sans-serif` : ''
        break
      case 'System':
      default:
        fontFam = ''
        break
    }

    const fontRule = fontFam ? `font-family: ${fontFam} !important;` : ''
    const sizeRule = cfg.fontSize ? `font-size: ${cfg.fontSize}px !important;` : ''
    const lineRule = cfg.lineHeight ? `line-height: ${cfg.lineHeight} !important;` : ''
    const digitsRule = cfg.persianDigits ? `font-feature-settings: "ss01" 1, "cv01" 1 !important;` : ''

    return `
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');

/* Dynamic Typography & Font Customizations */
[data-v4-timeline-scroll],
[data-v4-timeline-message-layer],
[data-v4-timeline-content-column],
[data-v4-timeline-virtual-history],
[data-trajectory-timeline],
[data-trajectory-message-role],
[data-trajectory-message-content],
[data-trajectory-expanded-content-shell],
[data-trajectory-user-content-card],
[data-v4-user-input-bubble],
[data-v4-user-input-collapsible-content],
[data-reasoning-content],
[data-v4-draft-greeting],
[data-v4-composer-dock] [data-lexical-editor="true"],
[data-v4-composer-dock] [data-testid="chat-input"],
[data-lexical-editor="true"] p,
[data-testid="chat-input"] p {
  ${fontRule}
  ${sizeRule}
  ${lineRule}
  ${digitsRule}
}

/* Ensure code blocks and tables always stay monospace */
[data-streamdown="code-block"],
[data-streamdown="code-block-body"],
[data-streamdown="inline-code"],
pre, code, kbd, samp {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 0.9em !important;
  line-height: 1.5 !important;
  font-feature-settings: normal !important;
}
`
  }

  const DIR_SELECTORS = [
    '[data-trajectory-message-content]',
    '[data-trajectory-expanded-content-shell]',
    '[data-trajectory-user-content-card]',
    '[data-v4-user-input-bubble]',
    '[data-reasoning-content]',
    '[data-streamdown]',
    '[data-v4-draft-greeting]',
    '[data-lexical-editor="true"]',
    '[data-lexical-editor="true"] p',
    '[data-testid="chat-input"]',
    '[data-testid="chat-input"] p'
  ]

  function firstWordDir(text) {
    const t = String(text || '').replace(/^\s+/, '')
    if (!t) return null
    const word = t.match(/^\S+/)
    if (!word) return null
    for (const ch of word[0]) {
      if (/[؀-ۿݐ-ݿࢠ-ࣿיִ-﷿ﹰ-]/.test(ch)) return 'rtl'
      if (/[A-Za-z]/.test(ch)) return 'ltr'
    }
    return null
  }

  function via() {
    window.__RTL_CHAT_VIAS = window.__RTL_CHAT_VIAS || []
    if (!window.__RTL_CHAT_VIAS.includes(VIA)) window.__RTL_CHAT_VIAS.push(VIA)
    return window.__RTL_CHAT_VIAS.join('+')
  }

  function ensureStyles() {
    let baseStyle = document.getElementById(STYLE_ID)
    if (!baseStyle) {
      baseStyle = document.createElement('style')
      baseStyle.id = STYLE_ID
      ;(document.head || document.documentElement).appendChild(baseStyle)
    }
    const targetBase = settings.enabled ? BASE_CSS : ''
    if (baseStyle.textContent !== targetBase) baseStyle.textContent = targetBase

    let dynStyle = document.getElementById(DYNAMIC_STYLE_ID)
    if (!dynStyle) {
      dynStyle = document.createElement('style')
      dynStyle.id = DYNAMIC_STYLE_ID
      ;(document.head || document.documentElement).appendChild(dynStyle)
    }
    const targetDyn = getDynamicCss(settings)
    if (dynStyle.textContent !== targetDyn) dynStyle.textContent = targetDyn
  }

  function applyDir(el, emptyDefault) {
    if (!el) return
    if (!settings.enabled) {
      if (el.hasAttribute('dir')) el.removeAttribute('dir')
      return
    }
    const text = el.innerText || el.textContent || ''
    let d = firstWordDir(text)
    if (!d && !text.trim() && emptyDefault) d = emptyDefault
    if (!d) return
    if (el.dir !== d) el.dir = d
  }

  function isLeafish(el) {
    const blockish = /^(P|DIV|SECTION|ARTICLE|UL|OL|LI|H[1-6]|TABLE|TR|FORM)$/
    if (blockish.test(el.tagName)) return false
    for (const c of el.children) {
      if (blockish.test(c.tagName)) return false
    }
    return true
  }

  function applyDirs() {
    if (!settings.enabled) {
      document.documentElement.removeAttribute('data-rtl-chat')
      return
    }
    document.documentElement.setAttribute('data-rtl-chat', 'on')

    const seen = new Set()
    for (const el of document.querySelectorAll('[data-v4-turn-unit]')) {
      if (el.hasAttribute('dir')) el.removeAttribute('dir')
    }

    for (const sel of DIR_SELECTORS) {
      let nodes = []
      try { nodes = document.querySelectorAll(sel) } catch (_) { continue }
      for (const el of nodes) {
        if (seen.has(el)) continue
        seen.add(el)
        const isEditor = el.matches('[data-lexical-editor="true"], [data-testid="chat-input"]')
        const isEditorP = el.matches('p') && !!el.closest('[data-lexical-editor="true"], [data-testid="chat-input"]')
        applyDir(el, isEditor || isEditorP ? 'rtl' : null)
      }
    }

    const blockSel = [
      '[data-v4-timeline-scroll] p',
      '[data-v4-timeline-scroll] button[data-testid^="chat-assistant-history-trigger"]',
      '[data-v4-timeline-scroll] h1',
      '[data-v4-timeline-scroll] h2',
      '[data-v4-timeline-scroll] h3',
      '[data-v4-timeline-scroll] h4',
      '[data-v4-timeline-scroll] li'
    ].join(',')
    for (const el of document.querySelectorAll(blockSel)) {
      if (seen.has(el)) continue
      if (el.closest('[data-v4-composer-dock]')) continue
      seen.add(el)
      applyDir(el, null)
    }

    const timeline = document.querySelector('[data-v4-timeline-scroll]')
    if (timeline) {
      const walker = document.createTreeWalker(timeline, NodeFilter.SHOW_TEXT)
      let node
      const leafSeen = new Set()
      while ((node = walker.nextNode())) {
        const text = (node.nodeValue || '').trim()
        if (text.length < 3) continue
        let el = node.parentElement
        if (!el || leafSeen.has(el) || seen.has(el)) continue
        if (el.closest('[data-v4-composer-dock]')) continue
        if (el.closest('[dir]')) continue
        if (!isLeafish(el)) continue
        leafSeen.add(el)
        seen.add(el)
        applyDir(el, null)
      }
    }

    const ed = document.querySelector('[data-lexical-editor="true"], [data-testid="chat-input"]')
    if (ed && !ed.__rtlChatHooked) {
      ed.__rtlChatHooked = true
      const update = () => {
        applyDir(ed, 'rtl')
        ed.querySelectorAll('p').forEach(p => applyDir(p, 'rtl'))
      }
      ed.addEventListener('input', update)
      ed.addEventListener('keyup', update)
    }
  }

  const toPersianDigits = n => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])

  function toggleSettingsPanel() {
    let panel = document.getElementById(PANEL_ID)
    if (panel) {
      if (panel.style.display === 'none') {
        renderPanelContent(panel)
        panel.style.display = 'block'
      } else {
        panel.style.display = 'none'
      }
      return
    }

    panel = document.createElement('div')
    panel.id = PANEL_ID
    panel.style.cssText = [
      'position:fixed',
      'bottom:44px',
      'right:16px',
      'width:310px',
      'max-width:calc(100vw - 32px)',
      'background:rgba(24,24,27,0.96)',
      'backdrop-filter:blur(16px)',
      '-webkit-backdrop-filter:blur(16px)',
      'border:1px solid rgba(255,255,255,0.12)',
      'border-radius:12px',
      'box-shadow:0 12px 36px rgba(0,0,0,0.6)',
      'color:#f4f4f5',
      'font-family:"Vazirmatn",system-ui,sans-serif',
      'font-size:13px',
      'direction:rtl',
      'z-index:2147483647',
      'padding:14px',
      'box-sizing:border-box',
      'user-select:none'
    ].join(';')

    panel.addEventListener('click', e => e.stopPropagation())
    ;(document.body || document.documentElement).appendChild(panel)
    renderPanelContent(panel)
  }

  function renderPanelContent(panel) {
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px; font-weight:700; font-size:14px; color:#fff;">
          <span style="font-size:15px;">⚙️</span>
          <span>تنظیمات چت فارسی</span>
        </div>
        <button id="rtl-panel-close" style="background:transparent; border:none; color:#a1a1aa; font-size:16px; cursor:pointer; padding:2px 6px; border-radius:4px; line-height:1;">✕</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="color:#e4e4e7;">راستچینسازی هوشمند (RTL)</span>
        <label style="position:relative; display:inline-block; width:38px; height:20px; cursor:pointer;">
          <input type="checkbox" id="rtl-toggle-enabled" ${settings.enabled ? 'checked' : ''} style="opacity:0; width:0; height:0;">
          <span style="position:absolute; top:0; left:0; right:0; bottom:0; background:${settings.enabled ? '#22c55e' : '#3f3f46'}; border-radius:20px; transition:0.2s;"></span>
          <span style="position:absolute; content:''; height:14px; width:14px; left:${settings.enabled ? '20px' : '3px'}; bottom:3px; background:#fff; border-radius:50%; transition:0.2s;"></span>
        </label>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; color:#d4d4d8; font-size:12px;">قلم متن چت (فونت):</label>
        <select id="rtl-select-font" style="width:100%; background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:6px 8px; font-size:12px; font-family:inherit; outline:none; cursor:pointer;">
          <option value="Vazirmatn" ${settings.fontFamily === 'Vazirmatn' ? 'selected' : ''}>وزیرمتن (Vazirmatn - پیشفرض)</option>
          <option value="Shabnam" ${settings.fontFamily === 'Shabnam' ? 'selected' : ''}>شبنم (Shabnam)</option>
          <option value="Sahel" ${settings.fontFamily === 'Sahel' ? 'selected' : ''}>ساحل (Sahel)</option>
          <option value="Samim" ${settings.fontFamily === 'Samim' ? 'selected' : ''}>صمیم (Samim)</option>
          <option value="Tahoma" ${settings.fontFamily === 'Tahoma' ? 'selected' : ''}>تاهما (Tahoma)</option>
          <option value="System" ${settings.fontFamily === 'System' ? 'selected' : ''}>پیشفرض برنامه</option>
          <option value="Custom" ${settings.fontFamily === 'Custom' ? 'selected' : ''}>فونت دلخواه دیگر...</option>
        </select>
        <input type="text" id="rtl-input-custom-font" value="${settings.customFont || ''}" placeholder="نام فونت دلخواه را بنویسید..." style="display:${settings.fontFamily === 'Custom' ? 'block' : 'none'}; width:100%; margin-top:6px; background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:5px 8px; font-size:12px; box-sizing:border-box; outline:none;">
      </div>

      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px;">
          <span style="color:#d4d4d8;">اندازه قلم:</span>
          <span id="rtl-val-font-size" style="color:#60a5fa; font-weight:700;">${toPersianDigits(settings.fontSize)}px</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button id="rtl-btn-font-dec" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:4px; width:26px; height:26px; cursor:pointer; font-weight:bold;">−</button>
          <input type="range" id="rtl-range-font-size" min="12" max="22" step="1" value="${settings.fontSize}" style="flex:1; cursor:pointer; accent-color:#3b82f6;">
          <button id="rtl-btn-font-inc" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:4px; width:26px; height:26px; cursor:pointer; font-weight:bold;">+</button>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px;">
          <span style="color:#d4d4d8;">فاصله خطوط:</span>
          <span id="rtl-val-line-height" style="color:#60a5fa; font-weight:700;">${toPersianDigits(settings.lineHeight)}</span>
        </div>
        <input type="range" id="rtl-range-line-height" min="1.3" max="2.4" step="0.05" value="${settings.lineHeight}" style="width:100%; cursor:pointer; accent-color:#3b82f6;">
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span style="color:#e4e4e7; font-size:12px;">نمایش اعداد فارسی (۰۱۲۳)</span>
        <label style="position:relative; display:inline-block; width:38px; height:20px; cursor:pointer;">
          <input type="checkbox" id="rtl-toggle-digits" ${settings.persianDigits ? 'checked' : ''} style="opacity:0; width:0; height:0;">
          <span style="position:absolute; top:0; left:0; right:0; bottom:0; background:${settings.persianDigits ? '#3b82f6' : '#3f3f46'}; border-radius:20px; transition:0.2s;"></span>
          <span style="position:absolute; content:''; height:14px; width:14px; left:${settings.persianDigits ? '20px' : '3px'}; bottom:3px; background:#fff; border-radius:50%; transition:0.2s;"></span>
        </label>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
        <button id="rtl-btn-reset" style="background:transparent; color:#f87171; border:1px solid rgba(248,113,113,0.3); border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; transition:0.2s;">
          بازنشانی به پیشفرض
        </button>
        <span style="font-size:10px; color:#71717a;">نسخه ${VERSION}</span>
      </div>
    `

    // Hook events inside panel
    panel.querySelector('#rtl-panel-close').addEventListener('click', () => {
      panel.style.display = 'none'
    })

    const chkEnabled = panel.querySelector('#rtl-toggle-enabled')
    chkEnabled.addEventListener('change', () => {
      settings.enabled = chkEnabled.checked
      saveSettings(settings)
      ensureStyles()
      applyDirs()
      updateBadge()
      renderPanelContent(panel)
    })

    const selFont = panel.querySelector('#rtl-select-font')
    const customFontInput = panel.querySelector('#rtl-input-custom-font')
    selFont.addEventListener('change', () => {
      settings.fontFamily = selFont.value
      customFontInput.style.display = selFont.value === 'Custom' ? 'block' : 'none'
      saveSettings(settings)
      ensureStyles()
    })

    customFontInput.addEventListener('input', () => {
      settings.customFont = customFontInput.value.trim()
      saveSettings(settings)
      ensureStyles()
    })

    const rangeFontSize = panel.querySelector('#rtl-range-font-size')
    const valFontSize = panel.querySelector('#rtl-val-font-size')
    const setFontSize = sz => {
      settings.fontSize = Math.min(24, Math.max(12, Number(sz)))
      rangeFontSize.value = settings.fontSize
      valFontSize.textContent = `${toPersianDigits(settings.fontSize)}px`
      saveSettings(settings)
      ensureStyles()
    }
    rangeFontSize.addEventListener('input', () => setFontSize(rangeFontSize.value))
    panel.querySelector('#rtl-btn-font-dec').addEventListener('click', () => setFontSize(settings.fontSize - 1))
    panel.querySelector('#rtl-btn-font-inc').addEventListener('click', () => setFontSize(settings.fontSize + 1))

    const rangeLineHeight = panel.querySelector('#rtl-range-line-height')
    const valLineHeight = panel.querySelector('#rtl-val-line-height')
    rangeLineHeight.addEventListener('input', () => {
      settings.lineHeight = Number(rangeLineHeight.value)
      valLineHeight.textContent = toPersianDigits(settings.lineHeight)
      saveSettings(settings)
      ensureStyles()
    })

    const chkDigits = panel.querySelector('#rtl-toggle-digits')
    chkDigits.addEventListener('change', () => {
      settings.persianDigits = chkDigits.checked
      saveSettings(settings)
      ensureStyles()
      renderPanelContent(panel)
    })

    panel.querySelector('#rtl-btn-reset').addEventListener('click', () => {
      settings = Object.assign({}, DEFAULT_SETTINGS)
      saveSettings(settings)
      ensureStyles()
      applyDirs()
      updateBadge()
      renderPanelContent(panel)
    })
  }

  // Close panel on outside click or Esc
  window.addEventListener('click', e => {
    const panel = document.getElementById(PANEL_ID)
    const badge = document.getElementById(BADGE_ID)
    if (panel && panel.style.display !== 'none') {
      if (!panel.contains(e.target) && (!badge || !badge.contains(e.target))) {
        panel.style.display = 'none'
      }
    }
  })

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const panel = document.getElementById(PANEL_ID)
      if (panel) panel.style.display = 'none'
    }
  })

  function updateBadge() {
    let badge = document.getElementById(BADGE_ID)
    if (!badge) {
      badge = document.createElement('div')
      badge.id = BADGE_ID
      ;(document.body || document.documentElement).appendChild(badge)
      badge.addEventListener('click', e => {
        e.stopPropagation()
        toggleSettingsPanel()
      })
    }

    const bg = settings.enabled ? 'rgba(185,28,28,0.92)' : 'rgba(75,85,99,0.92)'
    badge.style.cssText = [
      'position:fixed',
      'bottom:14px',
      'right:16px',
      'left:auto',
      'z-index:2147483647',
      `background:${bg}`,
      'color:#fff',
      'padding:2px 8px',
      'border-radius:4px',
      'font:700 11px/1.3 system-ui,sans-serif',
      'letter-spacing:0.04em',
      'direction:ltr',
      'cursor:pointer',
      'box-shadow:0 1px 4px rgba(0,0,0,0.3)',
      'transition:all 0.15s ease',
      'display:flex',
      'align-items:center',
      'gap:4px',
      'user-select:none'
    ].join(';')

    badge.title = 'تنظیمات راستچین و فونت (کلیک کنید)'
    badge.innerHTML = settings.enabled
      ? 'RTL <span style="font-size:9px;opacity:0.85;">⚙</span>'
      : 'RTL OFF <span style="font-size:9px;opacity:0.85;">⚙</span>'

    window.__RTL_CHAT = {
      version: VERSION,
      via: via(),
      style: !!document.getElementById(STYLE_ID),
      ready: document.readyState,
      settings: Object.assign({}, settings)
    }
  }

  function boot() {
    const first = !window.__RTL_CHAT_BOOTED
    window.__RTL_CHAT_BOOTED = true
    if (first && settings.enabled) {
      document.documentElement.setAttribute('data-rtl-chat', 'on')
    }
    via()
    ensureStyles()
    applyDirs()
    updateBadge()

    if (window.__RTL_CHAT_TIMER) clearInterval(window.__RTL_CHAT_TIMER)
    window.__RTL_CHAT_TIMER = setInterval(() => {
      ensureStyles()
      applyDirs()
      updateBadge()
    }, 2000)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true })
  } else {
    boot()
  }
})()
