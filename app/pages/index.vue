<template>
  <div class="page">
    <div class="noise-overlay"></div>

    <header class="header">
      <div class="logo">
        <span class="logo-icon">⌗</span>
        <span class="logo-text">URL Shortener</span>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <div class="hero-label">
          <span class="pulse-dot"></span>
          URL Shortener — Fast & Free
        </div>
        <h1 class="hero-title">
          Long links.<br />
          <span class="accent">Short</span> story.
        </h1>
        <p class="hero-sub">
          วาง URL ยาวๆ แล้วรับลิงค์สั้นในพริบตา ฟรี ไม่ต้องสมัครสมาชิก
        </p>

        <div class="input-block" :class="{ 'has-error': error }">
          <div class="input-row">
            <span class="input-prefix">🔗</span>
            <input
              v-model="url"
              type="text"
              placeholder="วาง URL ของคุณที่นี่..."
              class="url-input"
              @keyup.enter="shorten"
              @input="error = ''"
            />
            <button class="shorten-btn" @click="shorten" :disabled="loading">
              <span v-if="!loading">ย่อลิงค์ →</span>
              <span v-else class="loading-dots"><i></i><i></i><i></i></span>
            </button>
          </div>
          <p v-if="error" class="error-msg">⚠ {{ error }}</p>
        </div>

        <transition name="slide-up">
          <div v-if="result" class="result-card">
            <div class="result-top">
              <div class="result-info">
                <p class="result-label">ลิงค์สั้นของคุณ</p>
                <a :href="result" target="_blank" class="result-url">{{ result }}</a>
              </div>
              <div class="result-actions">
                <button class="copy-btn" @click="copy" :class="{ copied }">
                  {{ copied ? '✓ คัดลอกแล้ว!' : 'คัดลอก' }}
                </button>
                <button class="reset-btn" @click="reset" title="ย่อลิงค์ใหม่">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7A6 6 0 1 0 7 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M1 3v4h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="original-url">
              <span class="original-label">จาก:</span>
              <span class="original-text">{{ recentLinks[0]?.original }}</span>
            </div>
          </div>
        </transition>

        <div class="recent-section" >
          <p class="recent-title">ลิงค์ล่าสุด</p>
          <div class="recent-list">
            <div v-for="(item, i) in recentLinks" :key="i" class="recent-item">
              <div class="recent-main">
                <a :href="item.short" target="_blank" class="recent-short">{{ item.short }}</a>
                <span class="recent-original">{{ item.original }}</span>
              </div>
              <button class="recent-copy" @click="copyText(item.short, i)" :class="{ copied: copiedIndex === i }">
                {{ copiedIndex === i ? '✓' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span>© 2025 snip.ly</span>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUrls } from '~/composable/api/useUrl';
import type { ReqURL } from '~/models/url/req/req-create-url';
import type { ResCreateURL } from '~/models/url/res/res-create-urls';

const url = ref('');
const error = ref('');
const result = ref('');
const loading = ref(false);
const copied = ref(false);
const recentLinks = ref<Array<{ short: string; original: string }>>([]);
const copiedIndex = ref<number | null>(null);

const { createUrl } = useUrls();

async function shorten() {
  if (!url.value.trim()) {
    error.value = 'กรุณาใส่ URL';
    return;
  }
  try {
    loading.value = true;
    const requestUrl = { original_url: url.value.trim() } as ReqURL;
    const res = await createUrl(requestUrl) as ResCreateURL;
    result.value = res.short_url;
    recentLinks.value.unshift({ short: res.short_url, original: url.value });
    url.value = '';
  } catch (err) {
    error.value = 'เกิดข้อผิดพลาดในการย่อ URL';
  } finally {
    loading.value = false;
  }
}

function copy() {
  if (result.value) {
    navigator.clipboard.writeText(result.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

function reset() {
  result.value = '';
  url.value = '';
  error.value = '';
}

function copyText(text: string, index: number) {
  navigator.clipboard.writeText(text);
  copiedIndex.value = index;
  setTimeout(() => {
    copiedIndex.value = null;
  }, 2000);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: #0b0c0e;
  color: #e8e6e0;
  font-family: 'Manrope', sans-serif;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.noise-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}

.header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 1.15rem;
  font-weight: 500;
  color: #e8e6e0;
}

.logo-icon { color: #a8ff78; font-size: 1.3rem; }
.logo-text em { font-style: normal; color: #a8ff78; }

.main {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.hero {
  width: 100%;
  max-width: 620px;
  text-align: center;
}

.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #a8ff78;
  margin-bottom: 1.25rem;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a8ff78;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.75); }
}

.hero-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2.8rem, 8vw, 4.5rem);
  line-height: 1.08;
  color: #f0ede6;
  margin-bottom: 1.1rem;
  font-weight: 400;
}

.accent { color: #a8ff78; font-style: italic; }

.hero-sub {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #5a5852;
  margin-bottom: 2.25rem;
}

.input-block {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 6px 6px 6px 16px;
  transition: border-color 0.2s;
  text-align: left;
}

.input-block:focus-within { border-color: rgba(168, 255, 120, 0.3); }
.input-block.has-error { border-color: rgba(255, 100, 80, 0.35); }

.input-row { display: flex; align-items: center; gap: 10px; }

.input-prefix { font-size: 1rem; line-height: 1; }

.url-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'DM Mono', monospace;
  font-size: 0.875rem;
  color: #e8e6e0;
  padding: 0.55rem 0;
  min-width: 0;
}

.url-input::placeholder { color: #2e2d2a; }

.shorten-btn {
  background: #a8ff78;
  color: #0b0c0e;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 9px;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s, transform 0.1s;
  min-width: 108px;
  text-align: center;
}

.shorten-btn:hover:not(:disabled) { background: #beff96; }
.shorten-btn:active:not(:disabled) { transform: scale(0.97); }
.shorten-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg {
  font-size: 0.78rem;
  color: #ff6450;
  padding: 0.45rem 0 0.05rem;
}

.loading-dots { display: flex; gap: 4px; align-items: center; justify-content: center; }
.loading-dots i {
  display: block; width: 5px; height: 5px; border-radius: 50%;
  background: #0b0c0e; animation: bounce 1s ease-in-out infinite;
}
.loading-dots i:nth-child(2) { animation-delay: 0.15s; }
.loading-dots i:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
}

.slide-up-enter-active { transition: all 0.38s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from { opacity: 0; transform: translateY(14px); }

.result-card {
  margin-top: 1rem;
  background: rgba(168, 255, 120, 0.05);
  border: 1px solid rgba(168, 255, 120, 0.18);
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
}

.result-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.result-label {
  font-size: 0.7rem;
  color: #6a6860;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 4px;
}

.result-url {
  font-family: 'DM Mono', monospace;
  font-size: 1.05rem;
  color: #a8ff78;
  text-decoration: none;
  font-weight: 500;
  word-break: break-all;
}
.result-url:hover { text-decoration: underline; }

.result-actions { display: flex; gap: 8px; flex-shrink: 0; }

.copy-btn {
  background: #a8ff78;
  color: #0b0c0e;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 7px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.18s;
  font-family: 'Manrope', sans-serif;
  white-space: nowrap;
}
.copy-btn.copied { background: #78d4ff; }
.copy-btn:hover:not(.copied) { background: #beff96; }

.reset-btn {
  background: transparent;
  color: #5a5852;
  border: 1px solid rgba(255,255,255,0.08);
  width: 34px;
  height: 34px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
}
.reset-btn:hover { color: #e8e6e0; border-color: rgba(255,255,255,0.18); }

.original-url {
  padding: 0.55rem 1.25rem;
  background: rgba(0,0,0,0.15);
  border-top: 1px solid rgba(168, 255, 120, 0.08);
  display: flex;
  gap: 8px;
  align-items: baseline;
  overflow: hidden;
}
.original-label {
  font-size: 0.7rem;
  color: #4a4844;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}
.original-text {
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  color: #3e3c38;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-section { margin-top: 2rem; text-align: left; }

.recent-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3e3c38;
  margin-bottom: 0.75rem;
}

.recent-list { display: flex; flex-direction: column; }

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.recent-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.recent-short {
  font-family: 'DM Mono', monospace;
  font-size: 0.85rem;
  color: #a8ff78;
  text-decoration: none;
  font-weight: 500;
}
.recent-short:hover { text-decoration: underline; }

.recent-original {
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: #3a3835;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-copy {
  background: transparent;
  color: #4a4844;
  border: 1px solid rgba(255,255,255,0.07);
  padding: 0.28rem 0.65rem;
  border-radius: 6px;
  font-size: 0.74rem;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  transition: color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.recent-copy:hover { color: #e8e6e0; border-color: rgba(255,255,255,0.15); }
.recent-copy.copied { color: #a8ff78; border-color: rgba(168,255,120,0.3); }

.footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 1.25rem;
  font-size: 0.75rem;
  color: #2a2925;
  border-top: 1px solid rgba(255,255,255,0.04);
}

@media (max-width: 480px) {
  .hero-title { font-size: 2.4rem; }
  .shorten-btn { padding: 0.65rem 0.9rem; min-width: 85px; font-size: 0.8rem; }
}
</style>