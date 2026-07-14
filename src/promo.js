import { resources } from './resources.js';

const scenes = [...document.querySelectorAll('.promo-scene')];
const progressFill = document.querySelector('.promo-progress__fill');
const resourceCount = document.querySelector('#promo-resource-count');

if (resourceCount) {
  resourceCount.textContent = `${resources.length}+ recursos gratuitos prontos para usar.`;
}

const sceneDuration = 5200;
let activeScene = 0;
let sceneTimer;
let progressTimer;
let progressStart = 0;

function showScene(index) {
  activeScene = (index + scenes.length) % scenes.length;
  scenes.forEach((scene, sceneIndex) => {
    scene.classList.toggle('is-active', sceneIndex === activeScene);
  });
  startProgress();
}

function startProgress() {
  clearInterval(progressTimer);
  progressStart = performance.now();
  if (progressFill) progressFill.style.width = '0';

  progressTimer = setInterval(() => {
    const elapsed = performance.now() - progressStart;
    const ratio = Math.min(elapsed / sceneDuration, 1);
    if (progressFill) progressFill.style.width = `${ratio * 100}%`;
    if (ratio >= 1) clearInterval(progressTimer);
  }, 40);
}

function restartSceneTimer() {
  clearInterval(sceneTimer);
  sceneTimer = setInterval(() => {
    showScene(activeScene + 1);
  }, sceneDuration);
}

showScene(0);
restartSceneTimer();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(sceneTimer);
    clearInterval(progressTimer);
    return;
  }

  showScene(activeScene);
  restartSceneTimer();
});
