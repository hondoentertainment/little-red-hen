// ============================================
// SHOWS.JS — Firestore → DOM renderer
// Shared by index.html (public) to dynamically
// render hero shows and upcoming shows grid.
// ============================================

const Shows = (() => {

  // --- Helpers ---
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  function parseDate(dateStr) {
    // dateStr = "2026-02-06"
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function isToday(dateStr) {
    return dateStr === todayStr();
  }

  function formatMonthDay(dateStr) {
    const d = parseDate(dateStr);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }

  function getWeekday(dateStr) {
    return WEEKDAYS[parseDate(dateStr).getDay()];
  }

  function getDay(dateStr) {
    return String(parseDate(dateStr).getDate()).padStart(2, '0');
  }

  function getMonth(dateStr) {
    return MONTHS[parseDate(dateStr).getMonth()];
  }

  // Get ISO week number for grouping
  function getWeekKey(dateStr) {
    const d = parseDate(dateStr);
    // Group by the Monday of the week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);
    return `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
  }

  // --- Firestore reads ---
  async function getUpcomingShows(db) {
    const today = todayStr();
    const snapshot = await db.collection('shows')
      .where('date', '>=', today)
      .orderBy('date', 'asc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  function getNextNDays(shows, n) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + n);

    return shows.filter(s => {
      const d = parseDate(s.date);
      return d >= today && d < cutoff;
    });
  }

  function groupShowsByWeek(shows) {
    const groups = {};
    shows.forEach(show => {
      const key = getWeekKey(show.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(show);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }

  // --- Week label formatting ---
  function formatWeekLabel(shows, weekKey) {
    // Check if any show in this group is today
    if (shows.some(s => isToday(s.date))) return 'This Week';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(nextWeekStart.getDate() + (7 - today.getDay()) + 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

    const firstDate = parseDate(shows[0].date);
    if (firstDate >= nextWeekStart && firstDate <= nextWeekEnd) return 'Next Week';

    // Default: show date range
    const first = shows[0].date;
    const last = shows[shows.length - 1].date;
    if (first === last) return formatMonthDay(first);
    return `${formatMonthDay(first)} – ${formatMonthDay(last)}`;
  }

  // --- DOM Rendering: Hero Shows ---
  function renderHeroShows(container, shows) {
    if (!container) return;

    const grid = container.querySelector('.hero-shows-grid');
    const moreLink = container.querySelector('.hero-shows-more a');
    if (!grid) return;

    if (shows.length === 0) {
      grid.innerHTML = '<div class="hero-show"><div class="hero-show-details"><h3 class="hero-show-name">Check back soon for upcoming shows</h3></div></div>';
      return;
    }

    grid.innerHTML = shows.map(show => {
      const tonight = isToday(show.date);
      let cardClass = 'hero-show';
      if (tonight) cardClass += ' hero-show--tonight';
      else if (show.badgeType === 'gold' || show.badgeType === 'special') cardClass += ' hero-show--special';

      let badgeHTML = '';
      if (tonight) {
        badgeHTML = '<div class="hero-show-badge">Tonight</div>';
      } else if (show.badge) {
        const badgeCls = show.badgeType === 'gold' ? ' hero-show-badge--gold' : '';
        badgeHTML = `<div class="hero-show-badge${badgeCls}">${show.badge}</div>`;
      }

      return `
        <a href="#schedule" class="${cardClass}">
          ${badgeHTML}
          <div class="hero-show-date">
            <span class="hero-show-weekday">${getWeekday(show.date)}</span>
            <span class="hero-show-daynum">${formatMonthDay(show.date)}</span>
          </div>
          <div class="hero-show-details">
            <h3 class="hero-show-name">${show.bandName}</h3>
            <p class="hero-show-meta">${show.time} &bull; ${show.cover}</p>
          </div>
        </a>
      `;
    }).join('');

    if (moreLink) {
      const currentMonth = MONTHS[new Date().getMonth()];
      moreLink.textContent = `See full ${currentMonth} lineup →`;
    }
  }

  // --- DOM Rendering: Upcoming Shows Grid ---
  function renderUpcomingShows(container, shows) {
    if (!container) return;

    const label = container.querySelector('.section-label');
    const grid = container.querySelector('.upcoming-grid');
    if (!grid) return;

    // Update month label
    if (label) {
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const now = new Date();
      label.textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    if (shows.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:40px 0;">No upcoming shows scheduled yet. Check back soon!</p>';
      return;
    }

    const weeks = groupShowsByWeek(shows);

    grid.innerHTML = weeks.map(([weekKey, weekShows]) => {
      const weekLabel = formatWeekLabel(weekShows, weekKey);

      const cards = weekShows.map(show => {
        const tonight = isToday(show.date);
        let cardClass = 'show-card';
        if (tonight) cardClass += ' show-card--tonight';
        else if (show.badgeType === 'special') cardClass += ' show-card--valentine';

        let badgeHTML = '';
        if (tonight) {
          badgeHTML = '<span class="show-badge show-badge--tonight">Tonight</span>';
        } else if (show.badge) {
          badgeHTML = `<span class="show-badge show-badge--special">${show.badge}</span>`;
        }

        return `
          <div class="${cardClass}">
            <div class="show-date">
              <span class="show-date-day">${getDay(show.date)}</span>
              <span class="show-date-month">${getMonth(show.date)}</span>
              <span class="show-date-weekday">${getWeekday(show.date)}</span>
            </div>
            <div class="show-info">
              ${badgeHTML}
              <h3 class="show-name">${show.bandName}</h3>
              <p class="show-time">${show.time}</p>
            </div>
            <div class="show-cover">${show.cover}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="upcoming-week">
          <div class="upcoming-week-label">${weekLabel}</div>
          <div class="upcoming-shows">${cards}</div>
        </div>
      `;
    }).join('');
  }

  // --- Init: called from index.html after Firebase loads ---
  async function init(db) {
    try {
      const shows = await getUpcomingShows(db);

      // Hero: next 3 days
      const heroContainer = document.querySelector('.hero-shows');
      const heroShows = getNextNDays(shows, 3);
      renderHeroShows(heroContainer, heroShows);

      // Mobile tonight banner
      const banner = document.getElementById('mobileTonightBanner');
      if (banner) {
        const tonightShow = shows.find(show => isToday(show.date));
        if (tonightShow) {
          banner.textContent = `Tonight: ${tonightShow.bandName} • ${tonightShow.time} • ${tonightShow.cover}`;
          banner.hidden = false;
        } else {
          banner.hidden = true;
        }
      }

      // Upcoming grid: all future shows
      const upcomingContainer = document.querySelector('.upcoming');
      renderUpcomingShows(upcomingContainer, shows);

      // Re-apply scroll reveal to dynamically added elements
      if (typeof applyRevealAnimations === 'function') {
        applyRevealAnimations();
      }
    } catch (err) {
      console.error('Error loading shows from Firestore:', err);
      // Leave fallback content in place
    }
  }

  return { init, getUpcomingShows, getNextNDays, groupShowsByWeek };

})();
