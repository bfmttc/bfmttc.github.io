'use strict';

// Add confirmed public addresses here. Empty strings keep the links inactive.
const resourceLinks = { paper: '', arxiv: '', code: '' };

for (const link of document.querySelectorAll('[data-resource]')) {
  const address = resourceLinks[link.dataset.resource];
  if (address !== '') {
    const parsed = new URL(address);
    if (parsed.protocol !== 'https:') throw new Error('Resource links must use HTTPS.');
    link.href = parsed.href;
    link.removeAttribute('aria-disabled');
    link.removeAttribute('title');
    link.querySelector('.pending').remove();
  }
}

const tasks = {
  1: 'Cup in basket',
  2: 'Parcel bag on shelf',
  3: 'Basket on shelf',
  4: 'Bottle in drawer',
};

// Values copied from the paper's real-robot results table.
// Each row is [Original, TTCO, State]; the final row is the reported mean.
const successRates = {
  sonic: [[55.0, 55.0, 0.0], [83.3, 91.7, 10.0], [53.3, 50.0, 0.0], [50.0, 60.0, 0.0], [60.4, 64.2, 2.5]],
  heft: [[0.0, 40.0, 13.3], [6.7, 55.0, 20.0], [0.0, 50.0, 8.3], [0.0, 50.0, 6.7], [1.7, 48.8, 12.1]],
};
const unavailableClips = new Set(['task-1-heft-state']);

let selectedTask = 1;
let selectedModel = 'sonic';
const comparisons = [...document.querySelectorAll('.comparison video')];
const comparisonButton = document.getElementById('play-comparison');
const taskButtons = [...document.querySelectorAll('[data-task]')];
const modelButtons = [...document.querySelectorAll('[data-model]')];
const resultRows = [...document.querySelectorAll('#real-results tbody tr')];

function updateDemonstrations() {
  for (const video of comparisons) {
    video.pause();
    const filename = `task-${selectedTask}-${selectedModel}-${video.dataset.label}`;
    const unavailable = unavailableClips.has(filename);
    video.hidden = unavailable;
    const placeholder = video.parentElement.querySelector('.missing-clip');
    if (placeholder) placeholder.hidden = !unavailable;
    if (unavailable) {
      video.removeAttribute('poster');
      video.querySelector('source').removeAttribute('src');
    } else {
      video.poster = `assets/images/${filename}.webp`;
      video.querySelector('source').src = `assets/videos/${filename}.mp4`;
    }
    video.setAttribute('aria-label', `${tasks[selectedTask]}: ${selectedModel.toUpperCase()} policy, ${video.dataset.label} labels`);
    video.load();
  }
  for (const button of taskButtons) button.setAttribute('aria-pressed', String(Number(button.dataset.task) === selectedTask));
  for (const button of modelButtons) button.setAttribute('aria-pressed', String(button.dataset.model === selectedModel));
  const context = `SONIC demonstrations → ${selectedModel.toUpperCase()} execution`;
  document.getElementById('demo-context').textContent = context;
  document.getElementById('results-caption').textContent = context;
  for (const [index, row] of resultRows.entries()) {
    const cells = row.querySelectorAll('td');
    for (const [column, cell] of [...cells].entries()) cell.textContent = successRates[selectedModel][index][column].toFixed(1);
    row.classList.toggle('selected', Number(row.dataset.resultTask) === selectedTask);
  }
  const [original, ours, state] = successRates[selectedModel][4];
  document.getElementById('result-note').textContent = `With ${selectedModel.toUpperCase()} as the target, optimized labels reach ${ours.toFixed(1)}% mean success. Original-command labels reach ${original.toFixed(1)}%; robot-state labels reach ${state.toFixed(1)}%.`;
  document.getElementById('demo-announcement').textContent = `${tasks[selectedTask]}. ${context}. Videos and results updated.`;
  comparisonButton.innerHTML = '<span aria-hidden="true">▶</span> Play comparison';
}

for (const button of taskButtons) {
  button.addEventListener('click', () => {
    const task = Number(button.dataset.task);
    if (task === selectedTask) return;
    selectedTask = task;
    updateDemonstrations();
  });
}

for (const button of modelButtons) {
  button.addEventListener('click', () => {
    const model = button.dataset.model;
    if (model === selectedModel) return;
    selectedModel = model;
    updateDemonstrations();
  });
}

comparisonButton.addEventListener('click', async () => {
  if (comparisons.some(video => !video.paused)) {
    for (const video of comparisons) video.pause();
    return;
  }
  const availableVideos = comparisons.filter(video => !video.hidden);
  for (const video of availableVideos) video.currentTime = 0;
  const results = await Promise.allSettled(availableVideos.map(video => video.play()));
  if (results.some(result => result.status === 'rejected')) {
    for (const video of comparisons) video.pause();
    document.getElementById('demo-announcement').textContent = 'Playback could not start. Use the individual video controls to play the clips.';
  }
});

function updateComparisonPlayback() {
  comparisonButton.innerHTML = comparisons.some(video => !video.paused)
    ? '<span aria-hidden="true">Ⅱ</span> Pause comparison'
    : '<span aria-hidden="true">▶</span> Play comparison';
}

for (const video of comparisons) {
  video.addEventListener('play', updateComparisonPlayback);
  video.addEventListener('pause', updateComparisonPlayback);
  video.addEventListener('ended', updateComparisonPlayback);
}

const film = document.getElementById('overview-film');
const chapters = [...document.querySelectorAll('[data-time]')];
for (const button of chapters) {
  button.addEventListener('click', async () => {
    film.currentTime = Number(button.dataset.time);
    try {
      await film.play();
    } catch {
      film.focus();
    }
  });
}
film.addEventListener('timeupdate', () => {
  for (const [index, button] of chapters.entries()) {
    const active = film.currentTime >= Number(button.dataset.time)
      && (index === chapters.length - 1 || film.currentTime < Number(chapters[index + 1].dataset.time));
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
});

// Play the small teaser only when visible and when motion is permitted.
const teaser = document.getElementById('teaser');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let userPausedTeaser = false;
teaser.addEventListener('pause', () => {
  if (!teaser.dataset.offscreenPause) userPausedTeaser = true;
});
teaser.addEventListener('play', () => { userPausedTeaser = false; });
const teaserObserver = new IntersectionObserver(async entries => {
  const entry = entries[0];
  if (entry.isIntersecting && !reducedMotion.matches && !userPausedTeaser) {
    delete teaser.dataset.offscreenPause;
    try { await teaser.play(); } catch { /* The visible native controls remain available. */ }
  } else if (!entry.isIntersecting && !teaser.paused) {
    teaser.dataset.offscreenPause = 'true';
    teaser.pause();
  }
}, { threshold: 0.25 });
teaserObserver.observe(teaser);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) teaser.pause();
});

document.querySelector('[data-result-task="1"]').classList.add('selected');
