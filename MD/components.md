# Wiederverwendbare HTML-Komponenten für `public/`-Unterseiten

> Pfade sind auf `public/`-Ebene ausgelegt (`../assets/`, `../index.html`).
> Einfach kopieren und einfügen – keine weiteren Anpassungen nötig.

---

## Navigation (für alle `public/`-Seiten)

```html
<nav class="nav" id="mainNav">
    <div class="nav-inner">
        <a href="../index.html" class="nav-logo">
            <img src="../assets/img/logo_white_trans.png" alt="ML Vision" id="navLogoImg">
        </a>
        <div class="nav-menu" id="navMenu">
            <div class="nav-center">
                <a href="../index.html#leistungen" onclick="toggleMenu()">Leistungen</a>
                <a href="../index.html#prozess" onclick="toggleMenu()">Prozess</a>
                <a href="../index.html#about" onclick="toggleMenu()">Über uns</a>
                <a href="../index.html#kontakt" onclick="toggleMenu()">Kontakt</a>
            </div>
            <div class="nav-mobile-footer">
                <a href="../index.html#kontakt" class="btn-primary btn-sm" onclick="toggleMenu()">Kostenlose Analyse</a>
                <a href="login.html" class="btn-outline btn-sm">LogIn</a>
            </div>
        </div>
        <div class="nav-actions">
            <a href="../index.html#kontakt" class="btn-primary btn-sm nav-cta">Kostenlose Analyse</a>
            <a href="login.html" class="btn-outline btn-sm">LogIn</a>
        </div>
        <button class="burger-menu" id="burgerBtn" onclick="toggleMenu()" aria-label="Menü öffnen">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</nav>
```

---

## Footer (für alle `public/`-Seiten)

```html
<footer class="footer">
    <div class="footer-top">
        <div class="footer-brand">
            <img src="../assets/img/logo_white_trans.png" alt="ML Vision" loading="lazy">
            <p>Intelligente Automatisierung und KI-Lösungen für Unternehmen in Düren &amp; NRW.</p>
            <div class="footer-social">
                <a href="https://www.instagram.com/ml_vision_?igsh=MXFvZjE3emZheGRueQ%3D%3D" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/ml-vision-gbr/about/?viewAsMember=true" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://x.com/ml_vision_?s=21" aria-label="X">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@ml_vision0?_r=1&_t=ZN-91S46Rdn0w2" aria-label="TikTok">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
            </div>
        </div>
        <div class="footer-links-col">
            <h4>Navigation</h4>
            <ul>
                <li><a href="../index.html">Startseite</a></li>
                <li><a href="../index.html#leistungen">Leistungen</a></li>
                <li><a href="../index.html#prozess">Prozess</a></li>
                <li><a href="../index.html#about">Über uns</a></li>
                <li><a href="../index.html#kontakt">Kontakt</a></li>
            </ul>
        </div>
        <div class="footer-links-col">
            <h4>Rechtliches</h4>
            <ul>
                <li><a href="impressum.html">Impressum</a></li>
                <li><a href="datenschutz.html">Datenschutz</a></li>
            </ul>
        </div>
        <div class="footer-links-col">
            <h4>Regionen</h4>
            <ul>
                <li><a href="ki-automatisierung-dueren.html">KI Düren</a></li>
                <li><a href="ki-automatisierung-dueren.html">Automatisierung NRW</a></li>
                <li><a href="blog.html">Blog</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2024–2026 ML Vision – Alle Rechte vorbehalten.</p>
    </div>
</footer>
```

---

## Head-Snippet (CSS + Favicon für `public/`-Seiten)

```html
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="icon" type="image/png" href="../assets/img/favicon.ico">
```

---

## Script-Snippet (JS für `public/`-Seiten)

```html
<script src="../assets/js/script.js"></script>
```

---

## Änderungen gegenüber Root `index.html`

| Element | Root (`index.html`) | Unterseiten (`public/`) |
|---|---|---|
| Logo `src` | `assets/img/...` | `../assets/img/...` |
| CSS `href` | `assets/css/style.css` | `../assets/css/style.css` |
| JS `src` | `assets/js/script.js` | `../assets/js/script.js` |
| Nav-Links | `#leistungen` etc. | `../index.html#leistungen` etc. |
| Login-Link | `public/login.html` | `login.html` |
| Impressum | `public/impressum.html` | `impressum.html` |
| Datenschutz | `public/datenschutz.html` | `datenschutz.html` |
| Blog | `public/blog.html` | `blog.html` |
| KI-Düren | `public/ki-automatisierung-dueren.html` | `ki-automatisierung-dueren.html` |
