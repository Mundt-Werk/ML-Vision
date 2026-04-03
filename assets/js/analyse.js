// ── STARFIELD — Analyse Pages (full-page background) ──────────────────────────
(function () {
    var canvas = document.getElementById('starsCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [], shootingStars = [], animId = null;
    var w = 0, h = 0;

    function resize() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = document.documentElement.scrollHeight;
        stars = [];
        var count = Math.min(Math.floor(w * h / 4500), 350);
        for (var i = 0; i < count; i++) {
            stars.push({
                x:          Math.random() * w,
                y:          Math.random() * h,
                r:          Math.random() * 1.5 + 0.2,
                phase:      Math.random() * Math.PI * 2,
                speed:      Math.random() * 0.022 + 0.005,
                brightness: Math.random() * 0.55 + 0.25
            });
        }
    }

    function spawnShootingStar() {
        shootingStars.push({
            x:     Math.random() * w * 0.75,
            y:     Math.random() * h * 0.55,
            vx:    Math.random() * 7 + 5,
            vy:    Math.random() * 4 + 2,
            len:   Math.random() * 110 + 55,
            life:  1.0,
            decay: Math.random() * 0.022 + 0.016
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            s.phase += s.speed;
            var alpha = s.brightness * (0.4 + 0.6 * Math.sin(s.phase));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
            ctx.fill();
        }

        if (Math.random() < 0.004) spawnShootingStar();

        for (var j = shootingStars.length - 1; j >= 0; j--) {
            var ss = shootingStars[j];
            var tailX = ss.x - ss.vx * (ss.len / (ss.vx + ss.vy));
            var tailY = ss.y - ss.vy * (ss.len / (ss.vx + ss.vy));
            var grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
            grad.addColorStop(0,    'rgba(255,255,255,' + ss.life.toFixed(3) + ')');
            grad.addColorStop(0.35, 'rgba(4,169,212,'  + (ss.life * 0.55).toFixed(3) + ')');
            grad.addColorStop(1,    'rgba(4,169,212,0)');
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ss.x    += ss.vx;
            ss.y    += ss.vy;
            ss.life -= ss.decay;
            if (ss.life <= 0 || ss.x > w + 60 || ss.y > h + 60) {
                shootingStars.splice(j, 1);
            }
        }

        animId = requestAnimationFrame(draw);
    }

    function start() {
        resize();
        if (!animId) draw();
    }

    window.addEventListener('resize', function () {
        cancelAnimationFrame(animId);
        animId = null;
        start();
    });

    // Re-size when page content changes height (e.g. accordions)
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(function () {
            cancelAnimationFrame(animId);
            animId = null;
            start();
        }).observe(document.body);
    }

    // Init after fonts/images loaded so scrollHeight is accurate
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
})();

// ── Lucide icons init ──────────────────────────────────────────────────────────
if (typeof lucide !== 'undefined') lucide.createIcons();
