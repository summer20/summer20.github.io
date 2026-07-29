(function () {
  'use strict';

  var CARDS = [
    { key: 'travel', img: 'assets/images/gallery-travel.jpg', alt: '陈慧莹戴草帽在茶园旅行留影', hasCaption: true },
    { key: 'reading', img: 'assets/images/gallery-reading.jpg', alt: '书桌上一摞个人成长类书籍', hasCaption: false },
    { key: 'swim', img: 'assets/images/gallery-swim.jpg', alt: '陈慧莹在泳池中自由泳练习', hasCaption: false },
    { key: 'ukulele', img: 'assets/images/gallery-ukulele.jpg', alt: '陈慧莹弹尤克里里自拍', hasCaption: false },
    { key: 'pilates', img: 'assets/images/gallery-pilates.jpg', alt: '陈慧莹在普拉提工作室训练', hasCaption: false },
    { key: 'award', img: 'assets/images/gallery-award.jpg', alt: '陈慧莹与团队在竞赛颁奖典礼上合影领奖', hasCaption: false },
    { key: 'billiards', img: 'assets/images/gallery-billiards.jpg', alt: '陈慧莹在台球厅打台球', hasCaption: false },
    { key: 'friends', img: 'assets/images/gallery-friends.jpg', alt: '陈慧莹与朋友们在草坪野餐合影', hasCaption: false }
  ];

  var order = [];
  var pointer = 0;

  function shuffle() {
    var arr = CARDS.map(function (_, i) { return i; });
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function currentLang() {
    var stored = localStorage.getItem('lang');
    return (stored === 'en') ? 'en' : 'zh';
  }

  function resolveText(dictPath) {
    var dict = (currentLang() === 'en') ? window.CONTENT_EN : window.CONTENT_ZH;
    var path = dictPath.split('.');
    var value = dict;
    for (var i = 0; i < path.length; i++) {
      value = value && value[path[i]];
    }
    return (typeof value === 'string') ? value : '';
  }

  function applyCard(card) {
    var img = document.getElementById('gallery-card-img');
    var label = document.getElementById('gallery-card-label');
    var caption = document.getElementById('gallery-card-caption');
    if (!img || !label || !caption) return;
    img.src = card.img;
    img.alt = card.alt;
    label.textContent = resolveText('gallery.' + card.key);
    label.setAttribute('data-i18n-key', 'gallery.' + card.key);
    if (card.hasCaption) {
      caption.textContent = resolveText('gallery.travelCaption');
      caption.setAttribute('data-i18n-key', 'gallery.travelCaption');
    } else {
      caption.textContent = '';
      caption.removeAttribute('data-i18n-key');
    }
  }

  function updateCounter() {
    var counter = document.getElementById('gallery-deck-counter');
    if (counter) counter.textContent = pointer + ' / ' + CARDS.length;
  }

  function drawNext() {
    if (pointer >= order.length) {
      order = shuffle();
      pointer = 0;
    }
    var card = CARDS[order[pointer]];
    pointer++;
    updateCounter();

    var flipcard = document.getElementById('gallery-flipcard');
    if (!flipcard) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !flipcard.classList.contains('is-flipped')) {
      applyCard(card);
      flipcard.classList.add('is-flipped');
      return;
    }

    flipcard.classList.remove('is-flipped');
    setTimeout(function () {
      applyCard(card);
      flipcard.classList.add('is-flipped');
    }, 300);
  }

  function initGalleryCards() {
    var btn = document.getElementById('gallery-draw-btn');
    if (!btn) return;
    order = shuffle();
    pointer = 0;
    updateCounter();
    btn.addEventListener('click', drawNext);
  }

  document.addEventListener('DOMContentLoaded', initGalleryCards);
})();
