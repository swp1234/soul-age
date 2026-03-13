/* ========================================
   Soul Age Test - App Logic
   12 deep questions, 4 options scored 1-4
   Soul age calculation from total score
   ======================================== */

(function() {
    'use strict';

    // --- i18n helpers (try-catch) ---
    function getI18n() {
        try {
            if (typeof i18n !== 'undefined' && i18n) return i18n;
        } catch (e) { /* ignore */ }
        return null;
    }

    function t(key, fallback) {
        try {
            var inst = getI18n();
            if (inst && typeof inst.t === 'function') {
                var val = inst.t(key);
                if (val && val !== key) return val;
            }
        } catch (e) { /* ignore */ }
        return fallback || key;
    }

    function fmt(template, values) {
        var result = template;
        for (var k in values) {
            if (values.hasOwnProperty(k)) {
                result = result.replace(new RegExp('\\{' + k + '\\}', 'g'), values[k]);
            }
        }
        return result;
    }

    function $(id) { return document.getElementById(id); }

    // --- Questions data ---
    var questions = [
        {
            key: 'q1',
            emoji: '\uD83C\uDF0D',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q2',
            emoji: '\u2694\uFE0F',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q3',
            emoji: '\uD83D\uDCAB',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q4',
            emoji: '\uD83D\uDC76',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q5',
            emoji: '\u23F3',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q6',
            emoji: '\uD83E\uDE76',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q7',
            emoji: '\uD83C\uDFB6',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q8',
            emoji: '\uD83D\uDC41\uFE0F',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q9',
            emoji: '\uD83C\uDF05',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q10',
            emoji: '\uD83D\uDCDC',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q11',
            emoji: '\uD83D\uDCA4',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        },
        {
            key: 'q12',
            emoji: '\u231B',
            options: [
                { key: 'a', points: 1 },
                { key: 'b', points: 2 },
                { key: 'c', points: 3 },
                { key: 'd', points: 4 }
            ]
        }
    ];

    // --- Tier definitions ---
    var tiers = [
        { key: 'infant',       emoji: '\uD83D\uDC76', color: '#fbbf24', minScore: 12, maxScore: 18, minAge: 100,     maxAge: 500 },
        { key: 'young',        emoji: '\u26A1',       color: '#f97316', minScore: 19, maxScore: 26, minAge: 1000,    maxAge: 3000 },
        { key: 'mature',       emoji: '\uD83C\uDF3F', color: '#10b981', minScore: 27, maxScore: 34, minAge: 5000,    maxAge: 10000 },
        { key: 'old',          emoji: '\uD83E\uDD89', color: '#6366f1', minScore: 35, maxScore: 42, minAge: 15000,   maxAge: 35000 },
        { key: 'transcendent', emoji: '\u2728',       color: '#a78bfa', minScore: 43, maxScore: 48, minAge: 50000,   maxAge: 100000 }
    ];

    // --- State ---
    var currentQuestion = 0;
    var totalScore = 0;
    var answers = [];
    var isTransitioning = false;

    // --- DOM caching ---
    var startScreen = $('startScreen');
    var quizScreen = $('quizScreen');
    var resultScreen = $('resultScreen');
    var startBtn = $('startBtn');
    var progressFill = $('progressFill');
    var progressText = $('progressText');
    var scenarioEmoji = $('scenarioEmoji');
    var questionText = $('questionText');
    var optionsContainer = $('optionsContainer');
    var questionCard = $('questionCard');
    var tierBadge = $('tierBadge');
    var soulMeterFill = $('soulMeterFill');
    var soulMeterGlow = $('soulMeterGlow');
    var soulAgeNumber = $('soulAgeNumber');
    var tierName = $('tierName');
    var tierDesc = $('tierDesc');
    var timelineTrack = $('timelineTrack');
    var retakeBtn = $('retakeBtn');
    var shareTwitterBtn = $('shareTwitter');
    var shareCopyBtn = $('shareCopy');
    var themeToggle = $('themeToggle');
    var themeIcon = $('themeIcon');
    var langBtn = $('langBtn');
    var langDropdown = $('langDropdown');
    var currentLangLabel = $('currentLang');

    // --- Language name map ---
    var langNames = {
        ko: '\uD55C\uAD6D\uC5B4', en: 'English', zh: '\u4E2D\u6587',
        hi: '\u0939\u093F\u0928\u094D\u0926\u0940', ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
        ja: '\u65E5\u672C\u8A9E', es: 'Espa\u00F1ol', pt: 'Portugu\u00EAs',
        id: 'Indonesia', tr: 'T\u00FCrk\u00E7e', de: 'Deutsch', fr: 'Fran\u00E7ais'
    };

    // --- Get tier from score ---
    function getTier(score) {
        for (var i = tiers.length - 1; i >= 0; i--) {
            if (score >= tiers[i].minScore) return tiers[i];
        }
        return tiers[0];
    }

    // --- Calculate soul age from score ---
    function calculateSoulAge(score) {
        var tier = getTier(score);
        var scoreRange = tier.maxScore - tier.minScore;
        var ageRange = tier.maxAge - tier.minAge;
        var scoreProgress = Math.min(score - tier.minScore, scoreRange) / scoreRange;
        var age = Math.round(tier.minAge + ageRange * scoreProgress);
        return age;
    }

    // --- Format age with commas ---
    function formatAge(age) {
        return age.toLocaleString();
    }

    // --- Screen management ---
    function showScreen(screen) {
        startScreen.style.display = 'none';
        quizScreen.style.display = 'none';
        resultScreen.style.display = 'none';
        startScreen.classList.remove('active');
        quizScreen.classList.remove('active');
        resultScreen.classList.remove('active');
        screen.style.display = '';
        screen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Theme toggle ---
    function initTheme() {
        var saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        }
        updateThemeIcon();
    }

    function updateThemeIcon() {
        var current = document.documentElement.getAttribute('data-theme');
        if (themeIcon) {
            themeIcon.textContent = current === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon();
        });
    }

    // --- Language selector ---
    function initLangSelector() {
        if (!langBtn || !langDropdown) return;

        langBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!langDropdown.contains(e.target) && e.target !== langBtn) {
                langDropdown.classList.remove('active');
            }
        });

        var langOptions = langDropdown.querySelectorAll('.lang-option');
        langOptions.forEach(function(option) {
            option.addEventListener('click', function() {
                var lang = this.getAttribute('data-lang');
                langDropdown.classList.remove('active');

                var inst = getI18n();
                if (inst && typeof inst.setLanguage === 'function') {
                    inst.setLanguage(lang).then(function() {
                        if (currentLangLabel) {
                            currentLangLabel.textContent = langNames[lang] || lang;
                        }
                        refreshCurrentView();
                    }).catch(function() {});
                }
            });
        });

        // Set initial label
        var inst = getI18n();
        if (inst && currentLangLabel) {
            currentLangLabel.textContent = langNames[inst.currentLang] || inst.currentLang;
        }
    }

    // --- Refresh current view after language change ---
    function refreshCurrentView() {
        if (quizScreen.classList.contains('active')) {
            renderQuestion();
        } else if (resultScreen.classList.contains('active')) {
            renderResult();
        }
    }

    // --- Start quiz ---
    function startQuiz() {
        currentQuestion = 0;
        totalScore = 0;
        answers = [];
        isTransitioning = false;
        showScreen(quizScreen);
        renderQuestion();

        if (typeof gtag === 'function') {
            gtag('event', 'quiz_start', { event_category: 'soul-age' });
        }
    }

    // --- Render question ---
    function renderQuestion() {
        var q = questions[currentQuestion];
        var qNum = currentQuestion + 1;
        var total = questions.length;

        // Update progress
        var pct = (currentQuestion / total) * 100;
        progressFill.style.width = pct + '%';
        progressText.textContent = qNum + ' / ' + total;

        // Scenario emoji
        scenarioEmoji.textContent = q.emoji;

        // Question text via i18n
        questionText.textContent = t('questions.' + q.key + '.text', 'Question ' + qNum);

        // Render options
        optionsContainer.innerHTML = '';
        optionsContainer.classList.remove('answered');
        q.options.forEach(function(opt, idx) {
            var btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = t('questions.' + q.key + '.' + opt.key, 'Option ' + (idx + 1));
            btn.addEventListener('click', function() {
                if (!isTransitioning) {
                    selectOption(idx);
                }
            });
            optionsContainer.appendChild(btn);
        });
    }

    // --- Get selection class from points ---
    function getSelectionClass(points) {
        if (points <= 1) return 'selected-infant';
        if (points <= 2) return 'selected-young';
        if (points <= 3) return 'selected-mature';
        return 'selected-old';
    }

    // --- Select option ---
    function selectOption(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        var q = questions[currentQuestion];
        var opt = q.options[index];
        var points = opt.points;

        // Store answer
        answers.push({
            questionIndex: currentQuestion,
            optionIndex: index,
            points: points
        });

        // Update total
        totalScore += points;

        // Visual feedback on selected button
        var buttons = optionsContainer.querySelectorAll('.option-btn');
        optionsContainer.classList.add('answered');
        buttons.forEach(function(btn, i) {
            if (i === index) {
                btn.classList.add(getSelectionClass(points));
            }
        });

        // Advance after delay
        setTimeout(function() {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                if (questionCard) {
                    questionCard.style.opacity = '0';
                    questionCard.style.transform = 'translateX(-30px)';
                    setTimeout(function() {
                        renderQuestion();
                        questionCard.style.opacity = '';
                        questionCard.style.transform = '';
                        isTransitioning = false;
                    }, 250);
                } else {
                    renderQuestion();
                    isTransitioning = false;
                }
            } else {
                // Quiz complete
                progressFill.style.width = '100%';
                showScreen(resultScreen);
                renderResult();
                isTransitioning = false;
            }
        }, 700);
    }

    // --- Animate number count ---
    function animateNumber(element, from, to, duration, formatFn) {
        var startTime = null;
        var diff = to - from;
        formatFn = formatFn || function(v) { return v; };

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(from + diff * eased);
            element.textContent = formatFn(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // --- Render result ---
    function renderResult() {
        var tier = getTier(totalScore);
        var soulAge = calculateSoulAge(totalScore);
        var resultCard = resultScreen.querySelector('.result-card');

        // Remove old tier classes
        tiers.forEach(function(t) {
            resultCard.classList.remove('tier-' + t.key);
        });
        resultCard.classList.add('tier-' + tier.key);

        // Tier badge
        tierBadge.textContent = tier.emoji;

        // Soul age with animation
        soulAgeNumber.textContent = '0';
        setTimeout(function() {
            animateNumber(soulAgeNumber, 0, soulAge, 1500, formatAge);
        }, 300);

        // Soul meter fill
        var normalized = ((totalScore - 12) / (48 - 12)) * 100;
        normalized = Math.max(0, Math.min(100, normalized));

        if (soulMeterFill) {
            soulMeterFill.style.width = '0%';
        }

        setTimeout(function() {
            if (soulMeterFill) {
                soulMeterFill.style.width = normalized + '%';
            }
        }, 500);

        // Tier name
        tierName.textContent = t('tiers.' + tier.key + '.name', tier.key);
        tierName.style.color = tier.color;

        // Tier description
        tierDesc.textContent = t('tiers.' + tier.key + '.desc', '');

        // Timeline
        renderTimeline(tier);

        // Percentile stat
        var percentile = Math.floor(Math.random() * 15) + 3;
        var percentileEl = $('percentileStat');
        if (percentileEl) {
            var pText = t('result.percentileStat', 'Only <strong>{percent}%</strong> of people share this soul age tier');
            percentileEl.innerHTML = pText.replace('{percent}', percentile);
        }

        // GA4 event
        if (typeof gtag === 'function') {
            gtag('event', 'quiz_complete', {
                event_category: 'soul-age',
                event_label: tier.key,
                value: soulAge
            });
        }
    }

    // --- Render soul timeline ---
    function renderTimeline(currentTier) {
        timelineTrack.innerHTML = '';

        tiers.forEach(function(tier) {
            var item = document.createElement('div');
            item.className = 'timeline-item';

            var isCurrent = tier.key === currentTier.key;
            var isPassed = tiers.indexOf(tier) < tiers.indexOf(currentTier);

            if (isCurrent) item.classList.add('active');
            if (isPassed) item.classList.add('passed');

            var emoji = document.createElement('span');
            emoji.className = 'timeline-emoji';
            emoji.textContent = tier.emoji;

            var info = document.createElement('div');
            info.className = 'timeline-info';

            var name = document.createElement('div');
            name.className = 'timeline-name';
            name.textContent = t('tiers.' + tier.key + '.name', tier.key);

            var age = document.createElement('div');
            age.className = 'timeline-age';
            age.textContent = t('tiers.' + tier.key + '.age', '~' + formatAge(tier.maxAge) + ' years');

            info.appendChild(name);
            info.appendChild(age);

            item.appendChild(emoji);
            item.appendChild(info);

            if (isCurrent) {
                var marker = document.createElement('span');
                marker.className = 'timeline-marker';
                marker.textContent = t('result.you', 'YOU');
                item.appendChild(marker);
            }

            timelineTrack.appendChild(item);
        });
    }

    // --- Share: Twitter ---
    function shareTwitter() {
        var tier = getTier(totalScore);
        var soulAge = calculateSoulAge(totalScore);
        var tierLabel = t('tiers.' + tier.key + '.name', tier.key);
        var text = fmt(t('share.text', 'My soul is {age} years old! I\'m a \"{tier}\" \uD83D\uDD2E Discover your soul\'s age:'), {
            age: formatAge(soulAge),
            tier: tierLabel
        });
        var url = 'https://dopabrain.com/soul-age/';
        window.open(
            'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
            '_blank',
            'noopener'
        );
        if (typeof gtag === 'function') {
            gtag('event', 'share', { method: 'twitter', content_type: 'quiz_result' });
        }
    }

    // --- Share: Copy URL ---
    function copyUrl() {
        var url = 'https://dopabrain.com/soul-age/';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
                showCopiedFeedback();
            }).catch(function() {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
        if (typeof gtag === 'function') {
            gtag('event', 'share', { method: 'copy', content_type: 'quiz_result' });
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showCopiedFeedback(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
    }

    function showCopiedFeedback() {
        if (!shareCopyBtn) return;
        var original = shareCopyBtn.textContent;
        shareCopyBtn.textContent = t('share.copied', 'Copied!');
        shareCopyBtn.classList.add('copied');
        setTimeout(function() {
            shareCopyBtn.textContent = t('share.copyUrl', 'Copy Link');
            shareCopyBtn.classList.remove('copied');
        }, 2000);
    }

    // --- Hide loader ---
    function hideLoader() {
        var loader = $('app-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    // --- Bind events ---
    function bindEvents() {
        if (startBtn) {
            startBtn.addEventListener('click', startQuiz);
        }

        if (retakeBtn) {
            retakeBtn.addEventListener('click', function() {
                showScreen(startScreen);
                if (soulMeterFill) soulMeterFill.style.width = '0%';
                if (soulAgeNumber) soulAgeNumber.textContent = '0';
            });
        }

        if (shareTwitterBtn) {
            shareTwitterBtn.addEventListener('click', shareTwitter);
        }

        if (shareCopyBtn) {
            shareCopyBtn.addEventListener('click', copyUrl);
        }
    }

    // --- Init ---
    function init() {
        initTheme();
        initLangSelector();
        bindEvents();

        var inst = getI18n();
        if (inst && typeof inst.loadTranslations === 'function') {
            inst.loadTranslations(inst.currentLang).then(function() {
                if (typeof inst.updateUI === 'function') {
                    inst.updateUI();
                }
                if (currentLangLabel) {
                    currentLangLabel.textContent = langNames[inst.currentLang] || inst.currentLang;
                }
                hideLoader();
            }).catch(function() {
                hideLoader();
            });
        } else {
            hideLoader();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
