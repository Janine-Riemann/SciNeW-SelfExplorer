/* ================================================================
   LIGHTBOX – Bild-Vergrößerung per Klick
   Diese Datei per <script src="lightbox.js"></script> einbinden
   (am besten kurz vor dem schließenden </body>-Tag)

   Nutzung: Bild einfach die Klasse "clickable-img" geben,
   der Rest passiert automatisch – keine weitere Funktion nötig:

       <img src="bild.png" class="clickable-img" alt="...">

   ================================================================ */

(function () {

  // Overlay + großes Bild einmalig erzeugen und ans Ende der Seite hängen
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.id = 'lightboxOverlay';

  const bigImg = document.createElement('img');
  bigImg.className = 'lightbox-img';
  bigImg.id = 'lightboxImg';

  overlay.appendChild(bigImg);
  document.body.appendChild(overlay);

  function openLightbox(src) {
    bigImg.src = src;
    overlay.classList.add('active');
  }

  function closeLightbox() {
    overlay.classList.remove('active');
  }

  // Klick auf dunklen Hintergrund schließt die Lightbox
  overlay.addEventListener('click', closeLightbox);

  // ESC-Taste schließt die Lightbox
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Alle vorhandenen Bilder mit Klasse "clickable-img" automatisch aktivieren
  function initClickableImages() {
    document.querySelectorAll('.clickable-img').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClickableImages);
  } else {
    initClickableImages();
  }

  // Falls Bilder erst später per JS in die Seite eingefügt werden,
  // kann diese Funktion manuell erneut aufgerufen werden:
  window.initLightboxImages = initClickableImages;

})();
