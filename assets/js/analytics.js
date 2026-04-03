(function () {
    const cfg = window.analyticsConfig || {};
    const hasId = (id) => typeof id === 'string' && id.trim() && !id.startsWith('YOUR_') && !/^X{4,}$/.test(id.trim()) && !/^[A-Z]+-X{4,}/.test(id.trim());

    // Hotjar
    if (hasId(cfg.hotjarId)) {
        (function (h, o, t, j, a, r) {
            h.hj = h.hj || function () {
                (h.hj.q = h.hj.q || []).push(arguments);
            };
            h._hjSettings = { hjid: cfg.hotjarId, hjsv: cfg.hotjarSv || 6 };
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = true;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }

    // Google Analytics / Ads (gtag)
    if (hasId(cfg.gtagId)) {
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${cfg.gtagId}`;
        document.head.appendChild(gtagScript);

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', cfg.gtagId, { anonymize_ip: true });
    }

    // Meta Pixel
    if (hasId(cfg.metaPixelId)) {
        !(function (f, b, e, v, n, t, s) {
            if (f.fbq) { return; }
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) { f._fbq = n; }
            n.push = n;
            n.loaded = true;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = true;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', cfg.metaPixelId);
        window.fbq('track', 'PageView');
    }
})();
