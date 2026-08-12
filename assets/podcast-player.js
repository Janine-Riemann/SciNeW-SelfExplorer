/* =========================================================
   Podcast-Mini-Player – gemeinsames Script
   Einbindung in jeder Lektionsseite, z.B. vor </body>:
   <script src="assets/podcast-player.js" defer></script>

   Erwartet pro Seite genau eine Podcast-Liste:
   <div class="pcx2" data-pcx2-root> ... <div data-pcx2-row ...></div> ... </div>
   und einen zugehörigen Mini-Player als direktes Geschwister-Element:
   <div class="pcx2-player" data-pcx2-player> ... </div>

   Unterstützt auch mehrere Podcast-Blöcke auf derselben Seite,
   solange jeder Block sein eigenes data-pcx2-player-Geschwister hat.
   ========================================================= */
(function () {
  function initPcx2(root) {
    // Der Player steht bewusst außerhalb von Tabs/Accordions (siehe Setup-Hinweis),
    // daher hier auf Dokumentebene suchen statt nur innerhalb des Eltern-Elements.
    // Bei mehreren Listen auf einer Seite wird der nächstgelegene Player verwendet,
    // sonst der erste im Dokument gefundene.
    var allPlayers = Array.prototype.slice.call(document.querySelectorAll('[data-pcx2-player]'));
    var playerEl = root.parentElement.querySelector('[data-pcx2-player]') || allPlayers[0];
    if (!playerEl) return;

    var rows = Array.prototype.slice.call(root.querySelectorAll('[data-pcx2-row]'));
    if (!rows.length) return;

    var audio = new Audio();
    var currentIndex = -1;

    var playBtn   = playerEl.querySelector('[data-pcx2-toggle]');
    var prevBtn   = playerEl.querySelector('[data-pcx2-prev]');
    var nextBtn   = playerEl.querySelector('[data-pcx2-next]');
    var closeBtn  = playerEl.querySelector('[data-pcx2-close]');
    var speedBtn  = playerEl.querySelector('[data-pcx2-speed]');
    var downloadBtn = playerEl.querySelector('[data-pcx2-download]');
    var titleEl   = playerEl.querySelector('[data-pcx2-player-title]');
    var eyebrowEl = playerEl.querySelector('[data-pcx2-player-eyebrow]');
    var curEl     = playerEl.querySelector('[data-pcx2-current]');
    var durEl     = playerEl.querySelector('[data-pcx2-duration]');
    var progress  = playerEl.querySelector('[data-pcx2-progress]');
    var progressFill = playerEl.querySelector('[data-pcx2-progress-fill]');

    var speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
    var speedIndex = 0;

    function fmt(sec) {
      if (!isFinite(sec) || sec < 0) return '0:00';
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function fileNameFromSrc(src, title) {
      var ext = (src.split('.').pop() || 'mp3').split('?')[0];
      var safeTitle = (title || 'folge').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return safeTitle + '.' + ext;
    }

    function setActiveRow(index) {
      rows.forEach(function (r, i) {
        r.classList.toggle('is-active', i === index);
      });
    }

    function loadRow(index, autoplay) {
      var row = rows[index];
      if (!row) return;
      currentIndex = index;
      var src = row.getAttribute('data-src');
      var title = row.getAttribute('data-title');
      audio.src = src;
      audio.playbackRate = speeds[speedIndex];
      titleEl.textContent = title;
      eyebrowEl.textContent = row.getAttribute('data-eyebrow');
      if (downloadBtn) {
        downloadBtn.href = src;
        downloadBtn.setAttribute('download', fileNameFromSrc(src, title));
      }
      setActiveRow(index);
      playerEl.classList.add('is-open');
      if (autoplay) audio.play();
    }

    function updatePlayingState(playing) {
      playerEl.classList.toggle('is-playing', playing);
      rows.forEach(function (r, i) {
        r.classList.toggle('is-playing', playing && i === currentIndex);
      });
    }

    rows.forEach(function (row, index) {
      row.addEventListener('click', function () {
        if (index === currentIndex) {
          audio.paused ? audio.play() : audio.pause();
        } else {
          loadRow(index, true);
        }
      });

      // Download-Icon pro Zeile: Link-Ziel automatisch aus data-src/data-title
      // befüllen, damit im HTML nichts doppelt gepflegt werden muss, und den
      // Klick stoppen, bevor er die Zeile erreicht (sonst würde zusätzlich
      // Play/Pause ausgelöst).
      var rowDownload = row.querySelector('[data-pcx2-row-download]');
      if (rowDownload) {
        var rowSrc = row.getAttribute('data-src');
        var rowTitle = row.getAttribute('data-title');
        rowDownload.setAttribute('href', rowSrc);
        rowDownload.setAttribute('download', fileNameFromSrc(rowSrc, rowTitle));
        rowDownload.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }
    });

    playBtn.addEventListener('click', function () {
      if (currentIndex === -1) { loadRow(0, true); return; }
      audio.paused ? audio.play() : audio.pause();
    });

    prevBtn.addEventListener('click', function () {
      if (currentIndex > 0) loadRow(currentIndex - 1, true);
    });
    nextBtn.addEventListener('click', function () {
      if (currentIndex < rows.length - 1) loadRow(currentIndex + 1, true);
    });
    closeBtn.addEventListener('click', function () {
      audio.pause();
      playerEl.classList.remove('is-open', 'is-playing');
      setActiveRow(-1);
      currentIndex = -1;
    });

    if (speedBtn) {
      speedBtn.addEventListener('click', function () {
        speedIndex = (speedIndex + 1) % speeds.length;
        audio.playbackRate = speeds[speedIndex];
        speedBtn.textContent = speeds[speedIndex] + '×';
      });
    }

    progress.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progress.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = ratio * audio.duration;
    });

    audio.addEventListener('play', function () { updatePlayingState(true); });
    audio.addEventListener('pause', function () { updatePlayingState(false); });
    audio.addEventListener('ended', function () {
      if (currentIndex < rows.length - 1) loadRow(currentIndex + 1, true);
      else updatePlayingState(false);
    });
    audio.addEventListener('loadedmetadata', function () {
      durEl.textContent = fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', function () {
      curEl.textContent = fmt(audio.currentTime);
      var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      progressFill.style.width = pct + '%';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-pcx2-root]').forEach(initPcx2);
  });
})();
