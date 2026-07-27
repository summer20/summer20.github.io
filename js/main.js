(function () {
  'use strict';

  function initTheme() {
    var stored = localStorage.getItem('theme');
    var theme = (stored === 'dark' || stored === 'light') ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    }
  }

  function setLang(lang) {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
    var dict = lang === 'en' ? window.CONTENT_EN : window.CONTENT_ZH;
    document.querySelectorAll('[data-i18n-key]').forEach(function (el) {
      var path = el.getAttribute('data-i18n-key').split('.');
      var value = dict;
      for (var i = 0; i < path.length; i++) {
        value = value && value[path[i]];
      }
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });
    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = lang === 'zh' ? 'EN' : '中';
    }
  }

  function initLang() {
    var stored = localStorage.getItem('lang');
    var lang = (stored === 'en' || stored === 'zh') ? stored : 'zh';
    setLang(lang);
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'zh';
        var next = current === 'zh' ? 'en' : 'zh';
        setLang(next);
        localStorage.setItem('lang', next);
      });
    }
  }

  function initMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
        toggle.classList.toggle('is-open');
      });
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove('is-open');
          toggle.classList.remove('is-open');
        });
      });
    }
  }

  function initNavHighlight() {
    var sections = document.querySelectorAll('main section[id]');
    var links = document.querySelectorAll('#nav-menu a[href^="#"]');
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initLang();
    initMobileMenu();
    initNavHighlight();
    initScrollReveal();
  });
})();
