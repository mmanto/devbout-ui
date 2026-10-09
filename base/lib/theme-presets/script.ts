/** Where the selected preset (and its prepared CSS) is persisted. */
export const THEME_PRESET_STORAGE_KEY = "theme-preset"

/**
 * Inline script that re-applies the stored preset while the browser parses the
 * document, before the first paint — otherwise the app flashes the base theme
 * on every reload. Must stay in sync with the payload
 * `components/theme-preset-provider.tsx` writes.
 */
export const THEME_PRESET_BOOTSTRAP_SCRIPT =
  "(function(){try{var raw=localStorage.getItem('theme-preset');if(!raw)return;var p=JSON.parse(raw);if(!p||typeof p!=='object')return;(p.fontUrls||[]).forEach(function(u){var l=document.createElement('link');l.rel='stylesheet';l.href=u;l.setAttribute('data-theme-preset','font');document.head.appendChild(l);});if(p.css){var s=document.createElement('style');s.setAttribute('data-theme-preset','tokens');s.textContent=p.css;document.head.appendChild(s);}}catch(e){}})();"
