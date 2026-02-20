(function () {
    "use strict";

    if (window.__portfolioAnalyticsLoaded) {
        return;
    }
    window.__portfolioAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
    }

    var path = window.location.pathname || "/";
    if (path.slice(-1) === "/") {
        path = path + "index.html";
    }

    function getPageType(pagePath) {
        if (/\/projects\/[^/]+\.html$/i.test(pagePath)) {
            return "project";
        }
        if (/\/prompt-library(?:\/|\.html)/i.test(pagePath)) {
            return "prompt_library";
        }
        if (/\/index\.html$/i.test(pagePath) || pagePath === "/") {
            return "home";
        }
        return "page";
    }

    var pageType = getPageType(path);
    var debugEnabled = /(?:\?|&)ga_debug=1(?:&|$)/.test(window.location.search || "");
    var debugPanel = null;
    var debugList = null;

    function ensureDebugPanel() {
        if (!debugEnabled || debugPanel || !document.body) {
            return;
        }
        debugPanel = document.createElement("aside");
        debugPanel.setAttribute("id", "portfolio-ga-debug");
        debugPanel.style.cssText = [
            "position:fixed",
            "right:12px",
            "bottom:12px",
            "width:340px",
            "max-height:45vh",
            "overflow:auto",
            "z-index:99999",
            "padding:10px 12px",
            "background:#111",
            "color:#f5f5f5",
            "font:12px/1.4 Consolas, monospace",
            "border:1px solid #444",
            "border-radius:8px",
            "box-shadow:0 8px 24px rgba(0,0,0,.35)"
        ].join(";");

        var title = document.createElement("div");
        title.textContent = "GA Debug";
        title.style.cssText = "font-weight:700;margin-bottom:8px;color:#9be7ff";
        debugPanel.appendChild(title);

        debugList = document.createElement("div");
        debugPanel.appendChild(debugList);
        document.body.appendChild(debugPanel);
    }

    function addDebugLine(message) {
        if (!debugEnabled) {
            return;
        }
        ensureDebugPanel();
        if (!debugList) {
            return;
        }
        var line = document.createElement("div");
        line.textContent = new Date().toLocaleTimeString() + "  " + message;
        line.style.marginBottom = "4px";
        debugList.appendChild(line);
        while (debugList.childNodes.length > 24) {
            debugList.removeChild(debugList.firstChild);
        }
    }

    function getSlugFromPath(pagePath) {
        var match = pagePath.match(/\/([^/]+)\.html$/i);
        return match ? match[1] : "unknown";
    }

    function inferLocation(el) {
        if (el.closest("header")) {
            return "header";
        }
        if (el.closest("nav")) {
            return "nav";
        }
        if (el.closest("footer")) {
            return "footer";
        }
        if (el.closest("#hero") || el.closest(".hero")) {
            return "hero";
        }
        if (el.closest("#projects") || el.closest(".projects-grid") || el.closest(".project-card")) {
            return "projects_section";
        }
        if (el.closest("#prompt-library")) {
            return "prompt_library_section";
        }
        if (el.closest("#contact") || el.closest(".contact-links")) {
            return "contact_section";
        }
        if (el.closest(".project-actions")) {
            return "project_actions";
        }
        if (el.closest("main")) {
            return "main";
        }
        return "other";
    }

    function safeText(text) {
        return (text || "").replace(/\s+/g, " ").trim().slice(0, 100);
    }

    function fireEvent(name, params, callback) {
        var payload = Object.assign(
            {
                page_type: pageType,
                page_path: path,
                transport_type: "beacon"
            },
            params || {}
        );
        if (debugEnabled) {
            payload.debug_mode = true;
        }
        if (typeof callback === "function") {
            payload.event_callback = callback;
        }
        if (debugEnabled && window.console && typeof window.console.info === "function") {
            window.console.info("[portfolio-ga]", name, payload);
        }
        addDebugLine("event: " + name);
        window.gtag("event", name, payload);
    }

    function getMeasurementId() {
        var gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js?id="]');
        if (!gaScript || !gaScript.src) {
            return "";
        }
        try {
            var srcUrl = new URL(gaScript.src, window.location.href);
            return srcUrl.searchParams.get("id") || "";
        } catch (_err) {
            return "";
        }
    }

    function ensureBaseConfig() {
        var measurementId = getMeasurementId();
        if (!measurementId) {
            addDebugLine("measurement id not found");
            return "";
        }
        // The inline <script> in <head> already calls gtag('js') and
        // gtag('config').  Only re-issue if that bootstrap is missing
        // (e.g. the snippet was removed from a page by mistake).
        // Calling config twice sends a duplicate page_view event.
        if (!window.__portfolioGaConfigured) {
            var alreadyBootstrapped = window.dataLayer && window.dataLayer.length > 0;
            if (!alreadyBootstrapped) {
                window.gtag("js", new Date());
                window.gtag("config", measurementId);
                addDebugLine("configured (bootstrap missing): " + measurementId);
            } else {
                addDebugLine("inline bootstrap detected, skipping duplicate config");
            }
            window.__portfolioGaConfigured = true;
        }
        return measurementId;
    }

    function enableDebugMode() {
        if (!debugEnabled) {
            return;
        }
        var measurementId = ensureBaseConfig();
        if (!measurementId) {
            return;
        }
        window.gtag("config", measurementId, { debug_mode: true });
    }

    function getAnchorFromEvent(event) {
        var target = event && event.target;
        if (!target) {
            return null;
        }

        // In some browsers, click target may be a text node.
        if (target.nodeType === 3 && target.parentElement) {
            target = target.parentElement;
        }

        if (target && typeof target.closest === "function") {
            return target.closest("a");
        }
        return null;
    }

    function shouldDelayNavigation(link, event) {
        if (!link || !event) {
            return false;
        }
        if (event.defaultPrevented || event.button !== 0) {
            return false;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return false;
        }
        var target = (link.getAttribute("target") || "").toLowerCase();
        if (target && target !== "_self") {
            return false;
        }
        return true;
    }

    function followLink(rawHref, resolvedUrl) {
        if (/^mailto:/i.test(rawHref)) {
            window.location.href = rawHref;
            return;
        }
        if (resolvedUrl && resolvedUrl.href) {
            window.location.href = resolvedUrl.href;
        }
    }

    function trackClickAndNavigate(eventName, params, event, link, rawHref, resolvedUrl) {
        if (!shouldDelayNavigation(link, event)) {
            fireEvent(eventName, params);
            return;
        }

        var navigated = false;
        var navigate = function () {
            if (navigated) {
                return;
            }
            navigated = true;
            followLink(rawHref, resolvedUrl);
        };

        event.preventDefault();
        fireEvent(eventName, params, navigate);
        window.setTimeout(navigate, 300);
    }

    function trackProjectSession() {
        if (pageType !== "project") {
            return;
        }

        var slug = getSlugFromPath(path);
        var viewedProjects = [];
        var sessionKey = "portfolio_projects_viewed";
        var firedKey = "portfolio_multi_project_fired";

        try {
            var raw = sessionStorage.getItem(sessionKey);
            viewedProjects = raw ? JSON.parse(raw) : [];
        } catch (_err) {
            viewedProjects = [];
        }

        if (!Array.isArray(viewedProjects)) {
            viewedProjects = [];
        }

        if (viewedProjects.indexOf(slug) === -1) {
            viewedProjects.push(slug);
            sessionStorage.setItem(sessionKey, JSON.stringify(viewedProjects));
        }

        if (viewedProjects.length >= 2 && !sessionStorage.getItem(firedKey)) {
            fireEvent("multi_project_session", {
                project_count: viewedProjects.length,
                project_slug: slug
            });
            sessionStorage.setItem(firedKey, "1");
        }
    }

    function trackCaseStudyReadComplete() {
        if (pageType !== "project") {
            return;
        }

        var slug = getSlugFromPath(path);
        var hitTime = false;
        var hitScroll = false;
        var fired = false;

        function maybeFire() {
            if (!fired && hitTime && hitScroll) {
                fired = true;
                fireEvent("case_study_read_complete", {
                    project_slug: slug,
                    read_threshold: "75pct_90s"
                });
                window.removeEventListener("scroll", onScroll);
            }
        }

        function onScroll() {
            var doc = document.documentElement;
            var maxHeight = Math.max(doc.scrollHeight, 1);
            var ratio = (window.scrollY + window.innerHeight) / maxHeight;
            if (ratio >= 0.75) {
                hitScroll = true;
                maybeFire();
            }
        }

        window.setTimeout(function () {
            hitTime = true;
            maybeFire();
        }, 90000);

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    function trackLinkClicks() {
        document.addEventListener(
            "click",
            function (event) {
                var link = getAnchorFromEvent(event);
                if (!link) {
                    return;
                }

                var href = (link.getAttribute("href") || "").trim();
                if (!href) {
                    return;
                }

                var text = safeText(link.textContent);
                var ctaLocation = inferLocation(link);
                var hasDownloadAttr = link.hasAttribute("download");
                var resolvedUrl;

                try {
                    resolvedUrl = new URL(href, window.location.href);
                } catch (_err) {
                    return;
                }

                var hostname = (resolvedUrl.hostname || "").toLowerCase();
                var pathname = (resolvedUrl.pathname || "").toLowerCase();
                var fileExtMatch = pathname.match(/\.([a-z0-9]+)$/i);
                var fileExt = fileExtMatch ? fileExtMatch[1] : "";
                var fileNameMatch = pathname.match(/\/([^/]+)$/);
                var fileName = fileNameMatch ? fileNameMatch[1] : "";

                if (/^mailto:/i.test(href)) {
                    trackClickAndNavigate("contact_click", {
                        contact_method: "email",
                        cta_location: ctaLocation,
                        link_text: text
                    }, event, link, href, resolvedUrl);
                    return;
                }

                if (hostname.indexOf("linkedin.com") !== -1) {
                    trackClickAndNavigate("linkedin_click", {
                        cta_location: ctaLocation,
                        link_text: text
                    }, event, link, href, resolvedUrl);
                    return;
                }

                if (hostname.indexOf("github.com") !== -1) {
                    trackClickAndNavigate("github_click", {
                        cta_location: ctaLocation,
                        link_text: text
                    }, event, link, href, resolvedUrl);
                    return;
                }

                if (/resume/i.test(fileName) && /^(pdf|doc|docx)$/i.test(fileExt)) {
                    trackClickAndNavigate("resume_download", {
                        cta_location: ctaLocation,
                        file_name: fileName,
                        file_type: fileExt
                    }, event, link, href, resolvedUrl);
                    return;
                }

                if (/\/projects\/[^/]+\.html$/i.test(pathname)) {
                    trackClickAndNavigate("project_card_click", {
                        cta_location: ctaLocation,
                        project_slug: getSlugFromPath(pathname),
                        link_text: text
                    }, event, link, href, resolvedUrl);
                    return;
                }

                if (hasDownloadAttr || /^(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|md|txt)$/i.test(fileExt)) {
                    trackClickAndNavigate("artifact_open", {
                        cta_location: ctaLocation,
                        artifact_name: fileName || text || "unknown",
                        artifact_type: fileExt || "download"
                    }, event, link, href, resolvedUrl);
                }
            },
            true
        );
    }

    function emitDebugHeartbeat() {
        if (!debugEnabled) {
            return;
        }
        fireEvent("portfolio_tracker_heartbeat", {
            tracker_version: "20260220h"
        });
    }

    function checkGtagLoaded() {
        if (!debugEnabled) {
            return;
        }

        // google_tag_manager is set by gtag.js when it loads and initialises.
        // If it exists, the real GA pipeline is running and draining dataLayer.
        var gtagLoaded = !!window.google_tag_manager;

        if (gtagLoaded) {
            addDebugLine("PASS  gtag.js loaded");
        } else {
            addDebugLine("BLOCKED  gtag.js did NOT load");
            addDebugLine("  -> ad blocker or network block");
            addDebugLine("  -> events are queued but NOT sent");
        }

        // Also check whether collect requests are possible by looking for
        // the measurement-ID container that gtag.js creates.
        var mid = getMeasurementId();
        var containerKey = mid ? mid.replace("G-", "G") : "";
        if (containerKey && window.google_tag_manager && window.google_tag_manager[containerKey]) {
            addDebugLine("PASS  container " + mid + " active");
        } else if (mid) {
            addDebugLine("WARN  container " + mid + " not active");
        }

        // Report dataLayer queue depth — items sitting here have NOT been
        // processed yet (or gtag.js is not loaded to consume them).
        var queueDepth = window.dataLayer ? window.dataLayer.length : 0;
        addDebugLine("dataLayer depth: " + queueDepth);

        // Schedule a recheck after 3s — gtag.js loads async so it may
        // arrive after our deferred script runs.
        window.setTimeout(function () {
            var loaded = !!window.google_tag_manager;
            if (!loaded) {
                addDebugLine("RECHECK  gtag.js still not loaded after 3s");
                addDebugLine("  -> likely blocked by extension/network");
            } else if (!gtagLoaded) {
                // It wasn't loaded before but is now — late arrival.
                addDebugLine("PASS  gtag.js arrived (late load)");
                addDebugLine("dataLayer depth: " + (window.dataLayer ? window.dataLayer.length : 0));
            }
        }, 3000);
    }

    if (debugEnabled) {
        addDebugLine("tracker loaded");
        addDebugLine("gtag type: " + typeof window.gtag);
    }

    ensureBaseConfig();
    trackProjectSession();
    trackCaseStudyReadComplete();
    trackLinkClicks();
    enableDebugMode();
    emitDebugHeartbeat();
    checkGtagLoaded();
})();
