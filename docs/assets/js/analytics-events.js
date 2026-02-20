(function () {
    "use strict";

    if (window.__portfolioAnalyticsLoaded || typeof window.gtag !== "function") {
        return;
    }
    window.__portfolioAnalyticsLoaded = true;

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

    function fireEvent(name, params) {
        var payload = Object.assign(
            {
                page_type: pageType,
                page_path: path
            },
            params || {}
        );
        window.gtag("event", name, payload);
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
                var link = event.target.closest("a");
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
                    fireEvent("contact_click", {
                        contact_method: "email",
                        cta_location: ctaLocation,
                        link_text: text
                    });
                    return;
                }

                if (hostname.indexOf("linkedin.com") !== -1) {
                    fireEvent("linkedin_click", {
                        cta_location: ctaLocation,
                        link_text: text
                    });
                    return;
                }

                if (hostname.indexOf("github.com") !== -1) {
                    fireEvent("github_click", {
                        cta_location: ctaLocation,
                        link_text: text
                    });
                    return;
                }

                if (/resume/i.test(fileName) && /^(pdf|doc|docx)$/i.test(fileExt)) {
                    fireEvent("resume_download", {
                        cta_location: ctaLocation,
                        file_name: fileName,
                        file_type: fileExt
                    });
                    return;
                }

                if (/\/projects\/[^/]+\.html$/i.test(pathname)) {
                    fireEvent("project_card_click", {
                        cta_location: ctaLocation,
                        project_slug: getSlugFromPath(pathname),
                        link_text: text
                    });
                    return;
                }

                if (hasDownloadAttr || /^(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|md|txt)$/i.test(fileExt)) {
                    fireEvent("artifact_open", {
                        cta_location: ctaLocation,
                        artifact_name: fileName || text || "unknown",
                        artifact_type: fileExt || "download"
                    });
                }
            },
            true
        );
    }

    trackProjectSession();
    trackCaseStudyReadComplete();
    trackLinkClicks();
})();
