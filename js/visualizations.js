(function () {
  'use strict';

  var SKILLS = [
    { label: 'Data Analysis', value: 95 },
    { label: 'Python', value: 90 },
    { label: 'SQL', value: 85 },
    { label: 'AI Tools', value: 82 },
    { label: 'Machine Learning', value: 78 },
    { label: 'Power BI', value: 70 }
  ];

  function polarPoint(cx, cy, radius, index, total) {
    var angle = -Math.PI / 2 + index * (2 * Math.PI / total);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function buildRadarSVG() {
    var cx = 130, cy = 130, maxR = 96, total = SKILLS.length;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 260 260');
    svg.setAttribute('class', 'radar-svg');

    [0.25, 0.5, 0.75, 1].forEach(function (ratio) {
      var pts = [];
      for (var i = 0; i < total; i++) {
        var p = polarPoint(cx, cy, maxR * ratio, i, total);
        pts.push(p.x + ',' + p.y);
      }
      var grid = document.createElementNS(svgNS, 'polygon');
      grid.setAttribute('points', pts.join(' '));
      grid.setAttribute('class', 'radar-grid');
      svg.appendChild(grid);
    });

    var dataPoints = [];
    SKILLS.forEach(function (skill, i) {
      var p = polarPoint(cx, cy, maxR * (skill.value / 100), i, total);
      dataPoints.push(p.x + ',' + p.y);
    });
    var dataPolygon = document.createElementNS(svgNS, 'polygon');
    dataPolygon.setAttribute('points', dataPoints.join(' '));
    dataPolygon.setAttribute('class', 'radar-data');
    svg.appendChild(dataPolygon);

    SKILLS.forEach(function (skill, i) {
      var labelPoint = polarPoint(cx, cy, maxR + 24, i, total);
      var text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', labelPoint.x);
      text.setAttribute('y', labelPoint.y);
      text.setAttribute('class', 'radar-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = skill.label;
      svg.appendChild(text);
    });

    return svg;
  }

  function renderRadar() {
    var mount = document.getElementById('radar-chart');
    if (!mount) return;
    mount.innerHTML = '';
    mount.appendChild(buildRadarSVG());
  }

  function animateRings() {
    var rings = document.querySelectorAll('.skill-ring-progress');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rings.forEach(function (ring) {
      var target = parseFloat(ring.getAttribute('data-value'));
      var r = parseFloat(ring.getAttribute('r'));
      var circumference = 2 * Math.PI * r;
      ring.style.strokeDasharray = circumference.toFixed(2);
      var card = ring.closest('.skill-ring-card');
      var counter = card ? card.querySelector('.skill-ring-value') : null;

      if (reduceMotion) {
        ring.style.strokeDashoffset = (circumference * (1 - target / 100)).toFixed(2);
        if (counter) counter.textContent = target + '%';
        return;
      }

      ring.style.strokeDashoffset = circumference.toFixed(2);
      if (counter) counter.textContent = '0%';
      requestAnimationFrame(function () {
        ring.style.transition = 'stroke-dashoffset 1.1s ease';
        ring.style.strokeDashoffset = (circumference * (1 - target / 100)).toFixed(2);
      });

      var start = null;
      var duration = 1100;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        if (counter) counter.textContent = Math.round(progress * target) + '%';
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function initSkills() {
    renderRadar();
    var section = document.getElementById('skills');
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      animateRings();
      return;
    }
    var triggered = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          animateRings();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  document.addEventListener('DOMContentLoaded', initSkills);
})();
