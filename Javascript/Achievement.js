document.addEventListener('DOMContentLoaded', () => {

    /* ---------------------------------------------------------
       1. Animate progress bars & rings on load
    --------------------------------------------------------- */
    const animateProgress = () => {
        document.querySelectorAll('.progress-bar-fill').forEach(bar => {
            const target = bar.dataset.value || 0;
            requestAnimationFrame(() => {
                setTimeout(() => { bar.style.width = target + '%'; }, 100);
            });
        });

        document.querySelectorAll('.progress-ring-fill').forEach(ring => {
            const radius = ring.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            const progress = parseFloat(ring.dataset.progress || 0);
            ring.style.strokeDasharray = `${circumference}`;
            ring.style.strokeDashoffset = `${circumference}`;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const offset = circumference - (progress / 100) * circumference;
                    ring.style.strokeDashoffset = offset;
                }, 150);
            });
        });
    };
    animateProgress();

    /* ---------------------------------------------------------
       2. Filters (All / Unlocked / Locked / In Progress / Tier)
    --------------------------------------------------------- */
    const filterChips = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.badge-card');
    const searchInput = document.getElementById('achievementSearch');
    const noResults = document.getElementById('noResults');

    const applyFilters = () => {
        const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
        const query = (searchInput?.value || '').trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach(card => {
            const status = card.dataset.status;
            const tier = card.dataset.tier;
            const name = card.dataset.name || '';

            let matchesFilter = true;
            if (activeFilter === 'unlocked') matchesFilter = status === 'unlocked';
            else if (activeFilter === 'locked') matchesFilter = status === 'locked';
            else if (activeFilter === 'in-progress') matchesFilter = status === 'in-progress';
            else if (['gold', 'silver', 'bronze'].includes(activeFilter)) matchesFilter = tier === activeFilter;

            const matchesSearch = !query || name.includes(query);
            const show = matchesFilter && matchesSearch;

            card.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });

        // Hide empty category groups
        document.querySelectorAll('.category-group').forEach(group => {
            const anyVisible = [...group.querySelectorAll('.badge-card')].some(c => c.style.display !== 'none');
            group.style.display = anyVisible ? '' : 'none';
        });

        if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    };

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    /* ---------------------------------------------------------
       3. Achievement unlock toast + confetti (demo trigger)
       Click an unlocked badge to preview the "just unlocked" moment.
    --------------------------------------------------------- */
    const toast = document.getElementById('unlockToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastXp = document.getElementById('toastXp');

    const spawnConfetti = () => {
        const pieces = ['🎉', '⭐', '✨', '🏆'];
        for (let i = 0; i < 18; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
            el.style.left = Math.random() * 100 + 'vw';
            el.style.animationDuration = (2 + Math.random() * 1.5) + 's';
            el.style.fontSize = (14 + Math.random() * 14) + 'px';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3600);
        }
    };

    const showUnlockToast = (title, xp) => {
        if (!toast) return;
        toastTitle.textContent = title;
        toastXp.textContent = xp;
        toast.classList.add('show');
        spawnConfetti();
        setTimeout(() => toast.classList.remove('show'), 3500);
    };

    document.querySelectorAll('.badge-card[data-status="unlocked"]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const title = card.querySelector('h5')?.textContent || 'Achievement';
            const xp = card.querySelector('.badge-xp')?.textContent || '+0 XP';
            showUnlockToast(title, xp);
        });
    });

});