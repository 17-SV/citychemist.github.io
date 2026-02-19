console.log("Script loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  // ================= FAQ Toggle =================
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-answer');

      if (item.classList.contains('active')) {
        // Closing
        answer.style.height = answer.scrollHeight + "px"; // set to current height
        requestAnimationFrame(() => {
          answer.style.height = "0px"; // animate to 0
        });
        item.classList.remove('active');
      } else {
        // Opening
        item.classList.add('active');
        answer.style.height = answer.scrollHeight + "px"; // animate to content height
        answer.addEventListener('transitionend', () => {
          if (item.classList.contains('active')) {
            answer.style.height = "auto"; // reset to auto after animation
          }
        }, { once: true });
      }
    });
  });
  // ================= Sidebar =================
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarItems = document.querySelectorAll('.sidebar-item');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      sidebar.classList.toggle('hidden');

      // 🔹 toggle button style
      sidebarToggle.classList.toggle('active', !sidebar.classList.contains('hidden'));
    });

    sidebarItems.forEach(item => {
      item.addEventListener('click', function () {
        const url = item.dataset.link;
        if (url) {
          window.location.href = url;
        }
        sidebar.classList.add('hidden');
        sidebarToggle.classList.remove('active'); // 🔹 reset button style
      });
    });

    document.addEventListener('click', function (e) {
      const clickedInsideSidebar = sidebar.contains(e.target);
      const clickedToggle = sidebarToggle.contains(e.target);
      sidebarToggle.classList.toggle('active', !sidebar.classList.contains('hidden'));
      if (!clickedInsideSidebar && !clickedToggle) {
        sidebar.classList.add('hidden');
        sidebarToggle.classList.remove('active'); // 🔹 reset when closed
      }
    });
  }



  // ================= Filter Buttons (Gallery View) =================
  const filterButtons = document.querySelectorAll('.filter-button');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;
      galleryItems.forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? 'flex' : 'none';
      });
    });
  });

  // ================= Weekly Chart =================


  // ================= Business Hours Logic =================

  // =============================
  // 📅 Business Hours Configuration
  // =============================
  const weekdayHours = { open: 9, close: 22 };
  const sundayHours = { open: 9, close: 14 };

  // 🪔 Special Diwali timing (Set MM-DD correctly)
  const diwaliDate = '11-08'; //Diwali 
  const diwaliHours = { open: 9, close: 18 };

  // 📅 Fixed Holidays (MM-DD)
  const holidays = ['03-03']; //Holi

  // =============================
  // 🕒 Date & Time Setup & Status Logic
  // =============================

  function formatTime(hours, minutes = 0) {
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}${minutes ? ":" + String(minutes).padStart(2, "0") : ""}\u00A0${ampm}`;
  }

  function updateBusinessStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentDay = now.getDay();
    const currentDateString = now.toISOString().slice(5, 10);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().slice(5, 10);

    let todayHours;
    if (currentDateString === diwaliDate) {
      todayHours = diwaliHours;
    } else if (currentDay === 0) {
      todayHours = sundayHours;
    } else {
      todayHours = weekdayHours;
    }

    let tomorrowHours;
    if (tomorrowDateString === diwaliDate) {
      tomorrowHours = diwaliHours;
    } else if (currentDay === 6) {
      tomorrowHours = sundayHours;
    } else {
      tomorrowHours = weekdayHours;
    }

    const isHolidayToday = holidays.includes(currentDateString);
    const isDiwaliToday = currentDateString === diwaliDate;
    const isHolidayTomorrow = holidays.includes(tomorrowDateString);

    // Find next open day (skipping holidays)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let nextOpenDate = new Date(now);
    let nextOpenHours = tomorrowHours;
    let daysAhead = 1;
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const checkDateStr = checkDate.toISOString().slice(5, 10);
      if (!holidays.includes(checkDateStr)) {
        nextOpenDate = checkDate;
        daysAhead = i;
        if (checkDateStr === diwaliDate) {
          nextOpenHours = diwaliHours;
        } else if (checkDate.getDay() === 0) {
          nextOpenHours = sundayHours;
        } else {
          nextOpenHours = weekdayHours;
        }
        break;
      }
    }
    const isTomorrowNextOpen = daysAhead === 1;
    const nextOpenDayName = dayNames[nextOpenDate.getDay()];

    function getNextOpenText() {
      if (isTomorrowNextOpen) {
        return `Opens tomorrow at ${formatTime(nextOpenHours.open)}.`;
      } else {
        return `Opens ${nextOpenDayName} at ${formatTime(nextOpenHours.open)}.`;
      }
    }

    const opensSoon = (currentHour === todayHours.open - 1 && currentMinutes >= 40) ||
      (currentHour === todayHours.open && currentMinutes <= 5);

    const closesSoon = (currentHour < todayHours.close) &&
      ((todayHours.close - currentHour === 0 && currentMinutes <= 30) ||
        (todayHours.close - currentHour === 1 && currentMinutes >= 30));

    // =============================
    // 🧱 DOM Elements & Updates
    // =============================
    const statusElement = document.getElementById('status');
    const timeInfoElement = document.getElementById('time-info');
    const homeItemElement = document.querySelector('.home-item');

    // Add festive note element dynamically — insert into .home-item, NOT inside #business-hours
    let festiveNoteElement = document.getElementById('festive-note');
    const businessHoursBox = document.getElementById('business-hours');
    if (!festiveNoteElement && homeItemElement) {
      festiveNoteElement = document.createElement('div');
      festiveNoteElement.id = 'festive-note';
      festiveNoteElement.style.display = 'none';
      festiveNoteElement.style.marginBottom = '0';
      festiveNoteElement.style.padding = '12px 16px';
      festiveNoteElement.style.borderRadius = '8px';
      festiveNoteElement.style.fontSize = '0.8rem';
      festiveNoteElement.style.fontWeight = '600';
      festiveNoteElement.style.textAlign = 'center';
      festiveNoteElement.style.background = 'linear-gradient(90deg, #ffda8a, #ffd35c, #ffda8a)';
      festiveNoteElement.style.color = '#7a4e00';
      festiveNoteElement.style.boxShadow = '0 0 10px rgba(255, 215, 100, 0.5)';
      festiveNoteElement.style.animation = 'festiveGlow 2.5s ease-in-out infinite';
      festiveNoteElement.style.maxWidth = '100%';
      // Insert BEFORE the business-hours div, inside home-item
      homeItemElement.insertBefore(festiveNoteElement, businessHoursBox);
    }

    // Inject CSS for animations if not already added
    if (!document.getElementById('festive-note-style')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'festive-note-style';
      styleTag.innerHTML = `
    @keyframes festiveGlow {
      0% { box-shadow: 0 0 8px rgba(255, 215, 100, 0.4); }
      50% { box-shadow: 0 0 16px rgba(255, 200, 50, 0.8); }
      100% { box-shadow: 0 0 8px rgba(255, 215, 100, 0.4); }
    }
    @keyframes splashPulse {
      0%, 100% { transform: scale(1); opacity: 0.55; }
      50%      { transform: scale(1.15); opacity: 0.75; }
    }
    @keyframes holiFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ===== HOLI STYLES ===== */
    .holi-note {
      position: relative;
      overflow: hidden;
      background: #ffffff;
      border-radius: 14px;
      padding: 20px 16px 16px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      animation: holiFadeIn 0.5s ease-out;
    }
    .holi-note .splash {
      position: absolute;
      border-radius: 50%;
      filter: blur(12px);
      animation: splashPulse 3s ease-in-out infinite;
      pointer-events: none;
    }
    .holi-note .splash.s1 { width: 50px; height: 50px; background: #ff1744; top: -10px; left: -8px; animation-delay: 0s; }
    .holi-note .splash.s2 { width: 40px; height: 40px; background: #ff9100; top: -6px; right: 15px; animation-delay: 0.5s; }
    .holi-note .splash.s3 { width: 35px; height: 35px; background: #ffea00; bottom: -5px; left: 20px; animation-delay: 1s; }
    .holi-note .splash.s4 { width: 45px; height: 45px; background: #00e676; bottom: -8px; right: -5px; animation-delay: 1.5s; }
    .holi-note .splash.s5 { width: 30px; height: 30px; background: #2979ff; top: 50%; left: -5px; animation-delay: 0.8s; }
    .holi-note .splash.s6 { width: 35px; height: 35px; background: #d500f9; top: 40%; right: -5px; animation-delay: 1.3s; }
    .holi-title {
      position: relative;
      font-size: 1.05rem;
      font-weight: 700;
      background: linear-gradient(90deg, #ff1744, #ff9100, #ffea00, #00e676, #2979ff, #d500f9, #ff1744);
      background-size: 300% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }
    .holi-subtitle {
      position: relative;
      font-size: 0.78rem;
      color: #444;
      font-weight: 400;
      line-height: 1.5;
    }
    .holi-reopen {
      position: relative;
      font-size: 0.72rem;
      color: #999;
      font-weight: 500;
      margin-top: 8px;
    }
    .holi-bg-effect {
      background-image: 
        radial-gradient(circle at 10% 15%, rgba(255, 23, 68, 0.03) 0%, transparent 25%),
        radial-gradient(circle at 90% 85%, rgba(41, 121, 255, 0.03) 0%, transparent 25%),
        radial-gradient(circle at 50% 5%, rgba(255, 234, 0, 0.02) 0%, transparent 30%),
        radial-gradient(circle at 85% 15%, rgba(0, 230, 118, 0.02) 0%, transparent 20%),
        radial-gradient(circle at 15% 85%, rgba(213, 0, 249, 0.02) 0%, transparent 20%);
      background-attachment: fixed;
    }

    /* ===== DIWALI STYLES ===== */
    @keyframes flameGlow {
      0%, 100% { transform: scale(1); opacity: 0.45; }
      50%      { transform: scale(1.12); opacity: 0.65; }
    }
    @keyframes goldenShimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .diwali-note {
      position: relative;
      overflow: hidden;
      background: #ffffff;
      border-radius: 14px;
      padding: 20px 16px 16px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      animation: holiFadeIn 0.5s ease-out;
    }
    .diwali-note .flame {
      position: absolute;
      border-radius: 50%;
      filter: blur(12px);
      animation: flameGlow 3s ease-in-out infinite;
      pointer-events: none;
    }
    .diwali-note .flame.f1 { width: 45px; height: 45px; background: #ffb300; top: -10px; left: -5px; animation-delay: 0s; }
    .diwali-note .flame.f2 { width: 35px; height: 35px; background: #ff9800; top: -6px; right: 10px; animation-delay: 0.5s; }
    .diwali-note .flame.f3 { width: 30px; height: 30px; background: #ffd54f; bottom: -5px; left: 15px; animation-delay: 1s; }
    .diwali-note .flame.f4 { width: 40px; height: 40px; background: #ff8f00; bottom: -8px; right: -3px; animation-delay: 1.5s; }
    .diwali-note .flame.f5 { width: 25px; height: 25px; background: #ffe082; top: 50%; left: -5px; animation-delay: 0.7s; }
    .diwali-note .flame.f6 { width: 28px; height: 28px; background: #ffca28; top: 45%; right: -4px; animation-delay: 1.2s; }
    .diwali-title {
      position: relative;
      font-size: 1.05rem;
      font-weight: 700;
      background: linear-gradient(90deg, #bf8600, #d4a017, #bf8600);
      background-size: 300% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: goldenShimmer 4s linear infinite;
      margin-bottom: 8px;
    }
    .diwali-subtitle {
      position: relative;
      font-size: 0.78rem;
      color: #555;
      font-weight: 400;
      line-height: 1.5;
    }
    .diwali-timing {
      position: relative;
      display: inline-block;
      font-size: 0.73rem;
      color: #b8860b;
      font-weight: 600;
      margin-top: 8px;
      padding: 3px 10px;
      border: 1px solid rgba(184, 134, 11, 0.2);
      border-radius: 20px;
      background: rgba(255, 193, 7, 0.08);
    }
    .diwali-bg-effect {
      background-image: 
        radial-gradient(circle at 10% 15%, rgba(255, 152, 0, 0.03) 0%, transparent 25%),
        radial-gradient(circle at 90% 85%, rgba(255, 183, 77, 0.03) 0%, transparent 25%),
        radial-gradient(circle at 50% 5%, rgba(255, 213, 79, 0.02) 0%, transparent 30%);
      background-attachment: fixed;
    }

    /* ===== TOMORROW HOLIDAY NOTICE ===== */
    .tomorrow-notice {
      position: relative;
      overflow: hidden;
      background: #fffdf7;
      border: 1px solid rgba(255, 153, 0, 0.15);
      border-radius: 10px;
      padding: 10px 14px;
      margin-top: 8px;
      text-align: center;
      font-size: 0.75rem;
      color: #7a5c00;
      font-weight: 500;
      line-height: 1.4;
      animation: holiFadeIn 0.5s ease-out;
    }
    .tomorrow-notice .tn-label {
      font-weight: 700;
      background: linear-gradient(180deg,#f9a825, #e65100, #d32f2f );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `;
      document.head.appendChild(styleTag);
    }

    let statusMessage, timeInfoMessage, statusClass, statusIcon, festiveNote;

    if (isHolidayToday) {
      statusMessage = 'Closed today on occasion of Holi';
      timeInfoMessage = getNextOpenText();
      statusClass = 'closed';
      statusIcon = '<div class="static-circle red"></div>';
      festiveNote = 'holi';

      if (festiveNoteElement) {
        festiveNoteElement.style.background = 'none';
        festiveNoteElement.style.backgroundSize = '';
        festiveNoteElement.style.boxShadow = 'none';
        festiveNoteElement.style.border = 'none';
        festiveNoteElement.style.animation = 'none';
        festiveNoteElement.style.padding = '0';
        festiveNoteElement.style.color = '';
        festiveNoteElement.style.textShadow = '';
      }
      document.body.classList.add('holi-bg-effect');
      document.body.classList.remove('diwali-bg-effect');

    } else if (isDiwaliToday) {
      festiveNote = 'diwali';

      if (festiveNoteElement) {
        festiveNoteElement.style.background = 'none';
        festiveNoteElement.style.backgroundSize = '';
        festiveNoteElement.style.boxShadow = 'none';
        festiveNoteElement.style.border = 'none';
        festiveNoteElement.style.animation = 'none';
        festiveNoteElement.style.padding = '0';
        festiveNoteElement.style.color = '';
        festiveNoteElement.style.textShadow = '';
      }
      document.body.classList.add('diwali-bg-effect');
      document.body.classList.remove('holi-bg-effect');

      if (currentHour >= todayHours.open && currentHour < todayHours.close) {
        statusMessage = 'Open now';
        timeInfoMessage = `Open until ${formatTime(todayHours.close)}.`;
        statusClass = 'open';
        statusIcon = '<div class="static-circle green beeping"></div>';
      } else if (opensSoon) {
        statusMessage = 'Opens soon';
        timeInfoMessage = `Opens at ${formatTime(todayHours.open)}.`;
        statusClass = 'soon';
        statusIcon = '<div class="static-circle yellow beeping"></div>';
      } else {
        statusMessage = 'Closed now';
        timeInfoMessage = getNextOpenText();
        statusClass = 'closed';
        statusIcon = '<div class="static-circle red"></div>';
      }

    } else {
      document.body.classList.remove('holi-bg-effect');
      document.body.classList.remove('diwali-bg-effect');

      if (festiveNoteElement) {
        festiveNoteElement.style.background = 'linear-gradient(90deg, #ffda8a, #ffd35c, #ffda8a)';
        festiveNoteElement.style.backgroundSize = 'auto';
        festiveNoteElement.style.color = '#7a4e00';
        festiveNoteElement.style.textShadow = 'none';
        festiveNoteElement.style.animation = 'festiveGlow 2.5s ease-in-out infinite';
        festiveNoteElement.style.border = 'none';
        festiveNoteElement.style.padding = '12px 16px';
        festiveNoteElement.style.boxShadow = '0 0 10px rgba(255, 215, 100, 0.5)';
      }

      if (opensSoon) {
        statusMessage = 'Opens soon';
        timeInfoMessage = `Opens at ${formatTime(todayHours.open)}.`;
        statusClass = 'soon';
        statusIcon = '<div class="static-circle yellow beeping"></div>';
        festiveNote = '';
      } else if (closesSoon) {
        statusMessage = 'Closes soon';
        timeInfoMessage = `Closes at ${formatTime(todayHours.close)}.`;
        statusClass = 'soon';
        statusIcon = '<div class="static-circle yellow beeping"></div>';
        festiveNote = '';
      } else if (currentHour >= todayHours.open && currentHour < todayHours.close) {
        statusMessage = 'Open now';
        timeInfoMessage = `Open until ${formatTime(todayHours.close)}.`;
        statusClass = 'open';
        statusIcon = '<div class="static-circle green beeping"></div>';
        festiveNote = '';
      } else {
        statusMessage = 'Closed now';
        if (currentHour < todayHours.open) {
          timeInfoMessage = `Opens at ${formatTime(todayHours.open)}.`;
        } else {
          timeInfoMessage = getNextOpenText();
        }
        statusClass = 'closed';
        statusIcon = '<div class="static-circle red"></div>';
        festiveNote = '';
      }
    }

    // 📝 Update DOM

    if (isHolidayToday && homeItemElement) {
      // Holi card
      if (statusElement) statusElement.style.display = 'none';
      if (timeInfoElement) timeInfoElement.style.display = 'none';
      if (festiveNoteElement) festiveNoteElement.style.display = 'none';

      let holiOverlay = document.getElementById('holi-overlay');
      if (!holiOverlay) {
        holiOverlay = document.createElement('div');
        holiOverlay.id = 'holi-overlay';
        homeItemElement.insertBefore(holiOverlay, businessHoursBox);
      }
      holiOverlay.innerHTML = `
        <div class="splash s1"></div>
        <div class="splash s2"></div>
        <div class="splash s3"></div>
        <div class="splash s4"></div>
        <div class="splash s5"></div>
        <div class="splash s6"></div>
        <div class="holi-title">Happy Holi!</div>
        <div class="holi-subtitle">We're closed today on occasion of Holi.</div>
        <div class="holi-reopen">${getNextOpenText()}</div>
      `;
      holiOverlay.style.display = 'block';
      homeItemElement.classList.add('holi-note');
      homeItemElement.classList.remove('diwali-note');

      // Hide diwali overlay if present
      const diwaliOverlay = document.getElementById('diwali-overlay');
      if (diwaliOverlay) diwaliOverlay.style.display = 'none';

    } else if (isDiwaliToday && homeItemElement) {
      // Diwali card — integrate status into overlay
      if (statusElement) statusElement.style.display = 'none';
      if (timeInfoElement) timeInfoElement.style.display = 'none';
      if (festiveNoteElement) festiveNoteElement.style.display = 'none';

      let diwaliOverlay = document.getElementById('diwali-overlay');
      if (!diwaliOverlay) {
        diwaliOverlay = document.createElement('div');
        diwaliOverlay.id = 'diwali-overlay';
        homeItemElement.insertBefore(diwaliOverlay, businessHoursBox);
      }

      // Status color for the integrated status line
      const diwaliStatusColor = statusClass === 'open' ? '#1db280' : statusClass === 'soon' ? '#e6a000' : '#cc3333';

      diwaliOverlay.innerHTML = `
        <div class="flame f1"></div>
        <div class="flame f2"></div>
        <div class="flame f3"></div>
        <div class="flame f4"></div>
        <div class="flame f5"></div>
        <div class="flame f6"></div>
        <div class="diwali-title">🪔 Happy Diwali!</div>
        
        <div class="diwali-timing">Diwali Hours: ${formatTime(diwaliHours.open)} – ${formatTime(diwaliHours.close)}</div>
        <div style="position:relative; font-size:0.95rem; color:${diwaliStatusColor}; font-weight:600; margin-top:12px; margin-bottom:7px;">
           ${statusMessage} ${statusIcon} <span style="color:#888; font-weight:500;font-size:0.91rem;">${timeInfoMessage}</span>
        </div>
      `;
      diwaliOverlay.style.display = 'block';
      homeItemElement.classList.add('diwali-note');
      homeItemElement.classList.remove('holi-note');

      // Hide holi overlay if present
      const holiOverlay = document.getElementById('holi-overlay');
      if (holiOverlay) holiOverlay.style.display = 'none';

    } else {
      // Normal day — restore everything
      const holiOverlay = document.getElementById('holi-overlay');
      if (holiOverlay) holiOverlay.style.display = 'none';
      const diwaliOverlay = document.getElementById('diwali-overlay');
      if (diwaliOverlay) diwaliOverlay.style.display = 'none';
      if (homeItemElement) {
        homeItemElement.classList.remove('holi-note');
        homeItemElement.classList.remove('diwali-note');
      }

      if (festiveNoteElement) {
        festiveNoteElement.innerText = festiveNote || '';
        festiveNoteElement.style.display = festiveNote ? 'block' : 'none';
      }

      if (statusElement) statusElement.style.display = '';
      if (timeInfoElement) timeInfoElement.style.display = '';
      if (statusElement && timeInfoElement) {
        statusElement.innerHTML = `${statusMessage} ${statusIcon}`;
        timeInfoElement.innerText = timeInfoMessage;
        statusElement.className = statusClass;
        timeInfoElement.className = 'time-info';
      }
    }

    // 📌 Tomorrow holiday advance notice
    let tomorrowNotice = document.getElementById('tomorrow-notice');
    if (isHolidayTomorrow && !isHolidayToday) {
      if (!tomorrowNotice && homeItemElement) {
        tomorrowNotice = document.createElement('div');
        tomorrowNotice.id = 'tomorrow-notice';
        tomorrowNotice.className = 'tomorrow-notice';
        homeItemElement.appendChild(tomorrowNotice);
      }
      if (tomorrowNotice) {
        tomorrowNotice.innerHTML = `<span class="tn-label">Note:</span> We will be closed tomorrow on the occasion of Holi.`;
        tomorrowNotice.style.display = 'block';
      }
    } else {
      if (tomorrowNotice) tomorrowNotice.style.display = 'none';
    }

    // 🏠 Border Color on Home Item
    if (homeItemElement) {
      if (isDiwaliToday) {
        homeItemElement.style.borderColor = '#ffb300';
      } else if (isHolidayToday) {
        homeItemElement.style.borderColor = '#e0e0e0';
      } else {
        homeItemElement.style.borderColor = statusClass === 'open' ? '#1db280' :
          statusClass === 'soon' ? '#ffa500' : '#ff0000';
      }
    }
  } // End of updateBusinessStatus

  // Initial call and set interval
  updateBusinessStatus();
  setInterval(updateBusinessStatus, 60000);

  // =============================
  // 📅 Weekly Hours Dropdown Animation
  // =============================
  const weeklyHoursList = document.getElementById('weekly-hours-list');
  if (weeklyHoursList) {
    // Base weekly hours
    weeklyHoursList.innerHTML = `
    <li>Mon - Sat : 9 am - 10 pm</li>
    <li>Sunday : 9 am - 2 pm</li>
    
  `
  }

  const businessHoursElement = document.getElementById('business-hours');
  const weeklyHoursElement = document.getElementById('weekly-hours');
  const toggleIcon = document.getElementById('toggle-hours');

  if (businessHoursElement && weeklyHoursElement) {
    businessHoursElement.addEventListener('click', () => {
      const answer = weeklyHoursElement;

      if (answer.classList.contains('show')) {
        // Closing
        answer.style.height = answer.scrollHeight + "px";
        requestAnimationFrame(() => {
          answer.style.height = "0px";
          answer.style.opacity = "0";
          answer.style.paddingBottom = "0px";
          answer.style.marginTop = "0px";
        });
        answer.addEventListener('transitionend', () => {
          answer.classList.remove('show');
          answer.style.height = "";
        }, { once: true });

      } else {
        // Opening
        answer.classList.add('show');
        answer.style.height = "0px";
        answer.style.opacity = "0";
        answer.style.paddingBottom = "0px";
        answer.style.marginTop = "0px";

        requestAnimationFrame(() => {
          answer.style.height = answer.scrollHeight + "px";
          answer.style.opacity = "1";
          answer.style.paddingBottom = "16px";
          answer.style.marginTop = "12px";
        });

        answer.addEventListener('transitionend', () => {
          if (answer.classList.contains('show')) {
            answer.style.height = "auto";
          }
        }, { once: true });
      }

      businessHoursElement.classList.toggle('active');
      if (toggleIcon) toggleIcon.classList.toggle('rotated');
    });
  }


  // ================= FULLSCREEN GALLERY =================
  const galleryImages = document.querySelectorAll('.gallery-image');
  const carousel = document.querySelector('.fullscreen-carousel');
  const carouselContainer = document.querySelector('.carousel-container');
  const carouselTag = document.querySelector('.carousel-tag');
  const carouselIndex = document.querySelector('.carousel-index');
  const exitBtn = document.querySelector('.carousel-exit');
  const filterButtonsCarousel = document.querySelectorAll('.carousel-filter');

  let slides = [], slidesFiltered = [], currentIndex = 0;
  let startX = 0, isDragging = false, wasSwipe = false;
  let swipeSuppressClick = false;

  const prevArrow = document.querySelector('.carousel-prev');
  const nextArrow = document.querySelector('.carousel-next');

  prevArrow?.addEventListener('click', prevSlide);
  nextArrow?.addEventListener('click', nextSlide);

  function buildSlides() {
    slides = [];
    galleryImages.forEach((img) => {
      const src = img.style.backgroundImage.slice(5, -2);
      const tag = img.closest('.gallery-item')?.dataset.category || "All";
      slides.push({ src, tag });
    });
    slidesFiltered = slides;
  }

  function renderSlides() {
    carouselContainer.innerHTML = slidesFiltered.map(slide =>
      `<div class="carousel-slide"><img src="${slide.src}" alt="Slide" /></div>`
    ).join('');
    updateCarouselPosition();
    updateCarouselUI();
  }

  function openCarousel(index) {
    currentIndex = index;
    renderSlides();
    carousel.classList.add('visible');
    document.body.style.overflow = 'hidden';

  }

  function updateCarouselPosition() {
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}vw)`;
  }

  function updateCarouselUI() {
    const current = slidesFiltered[currentIndex];
    carouselTag.textContent = current?.tag || "";
    carouselIndex.textContent = `${currentIndex + 1} / ${slidesFiltered.length}`;
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slidesFiltered.length;
    updateCarouselPosition();
    updateCarouselUI();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slidesFiltered.length) % slidesFiltered.length;
    updateCarouselPosition();
    updateCarouselUI();
  }

  buildSlides();

  galleryImages.forEach((img, i) => {
    img.addEventListener('click', () => {
      if (swipeSuppressClick) return;
      openCarousel(i);
    });

  });

  exitBtn?.addEventListener('click', () => {
    carousel.classList.remove('visible');
    setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 350); // match CSS transition time


    document.body.style.overflow = 'auto';
  });

  document.addEventListener('keydown', (e) => {
    if (carousel.style.display !== 'flex') return;
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape') exitBtn.click();
  });

  carouselContainer.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isDragging = true;
    wasSwipe = false;
  });

  carouselContainer.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const moveX = e.touches[0].clientX - startX;
    if (Math.abs(moveX) > 10) {
      wasSwipe = true;
      swipeSuppressClick = true;
    }

    carouselContainer.style.transform = `translateX(calc(-${currentIndex * 100}vw + ${moveX}px))`;
  });

  carouselContainer.addEventListener('touchend', e => {
    isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    if (deltaX > 50) prevSlide();
    else if (deltaX < -50) nextSlide();
    else updateCarouselPosition();
    setTimeout(() => swipeSuppressClick = false, 200);

  });

  filterButtonsCarousel.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedFilter = btn.dataset.filter;
      filterButtonsCarousel.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      slidesFiltered = selectedFilter === "all" ? slides : slides.filter(s => s.tag === selectedFilter);
      currentIndex = 0;
      renderSlides();
    });
  });

});
