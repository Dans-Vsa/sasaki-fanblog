/* Entry point for index.html (story) and wiki.html. */
import { $, initLang, setLevel, spoilerChosen, level } from './core.js';
import { renderChrome, askSpoilerIfNeeded } from './chrome.js';
import { initSpoilers } from './spoiler.js';
import { initReveals, initHoles, runIntro } from './fx.js';

const page = document.body.dataset.page;

async function boot() {
  document.documentElement.classList.add('js');
  renderChrome(page);
  document.body.dataset.spoiler = String(Math.max(0, level));
  const intro = runIntro(); // plays while the dictionary loads
  try {
    await initLang();
  } catch (err) {
    console.error(err);
  }
  if (page === 'wiki') (await import('./wiki.js')).initWiki();
  else (await import('./story.js')).initStory();
  initSpoilers();
  initReveals();
  initHoles();
  document.documentElement.classList.add('is-ready');
  await intro;
  if (!spoilerChosen()) askSpoilerIfNeeded();
  // deep link (#act3 etc.) after content exists
  if (location.hash) $(location.hash)?.scrollIntoView();
}

boot();
export { setLevel };
