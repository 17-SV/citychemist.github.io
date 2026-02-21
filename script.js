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
  const holidays = ['02-21']; //Holi

  // =============================
  // 🕒 Date & Time Setup & Status Logic
  // =============================

  function formatTime(hours, minutes = 0) {
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}${minutes ? ":" + String(minutes).padStart(2, "0") : ""}\u00A0${ampm}`;
  }

  function updateBusinessStatus() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
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
    @keyframes holiFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .holi-note {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 0% 0%, rgba(255, 23, 68, 0.13) 0%, transparent 40%),
        radial-gradient(circle at 100% 0%, rgba(255, 165, 0, 0.12) 0%, transparent 38%),
        radial-gradient(circle at 0% 100%, rgba(255, 234, 0, 0.11) 0%, transparent 40%),
        radial-gradient(circle at 100% 100%, rgba(0, 230, 118, 0.13) 0%, transparent 38%),
        radial-gradient(circle at 0% 50%, rgba(41, 121, 255, 0.10) 0%, transparent 32%),
        radial-gradient(circle at 100% 50%, rgba(213, 0, 249, 0.11) 0%, transparent 32%),
        radial-gradient(circle at 50% 0%, rgba(255, 64, 129, 0.09) 0%, transparent 35%),
        radial-gradient(circle at 50% 100%, rgba(0, 191, 165, 0.10) 0%, transparent 35%),
        radial-gradient(circle at 25% 30%, rgba(255, 213, 79, 0.08) 0%, transparent 30%),
        radial-gradient(circle at 75% 30%, rgba(105, 240, 174, 0.08) 0%, transparent 30%),
        radial-gradient(circle at 25% 70%, rgba(124, 77, 255, 0.08) 0%, transparent 30%),
        radial-gradient(circle at 75% 70%, rgba(255, 109, 0, 0.08) 0%, transparent 30%),
        #ffffff;
      border-radius: 14px;
      padding: 20px 16px 16px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      animation: holiFadeIn 0.5s ease-out;
    }

    .holi-grain-dot {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
    }
    .holi-note .splash {
      position: absolute;
      pointer-events: none;
      opacity: 0.7;
    }
    .holi-note .splash svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .holi-note .splash.s1 { width: 70px; height: 65px; top: -18px; left: -15px; opacity: 0.75; }
    .holi-note .splash.s2 { width: 55px; height: 55px; top: -14px; right: 8px; opacity: 0.7; }
    .holi-note .splash.s3 { width: 50px; height: 50px; bottom: -12px; left: 12px; opacity: 0.65; }
    .holi-note .splash.s4 { width: 65px; height: 60px; bottom: -16px; right: -10px; opacity: 0.72; }
    .holi-note .splash.s5 { width: 45px; height: 45px; top: 45%; left: -12px; opacity: 0.6; }
    .holi-note .splash.s6 { width: 48px; height: 50px; top: 35%; right: -10px; opacity: 0.65; }
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
      margin-top: -20px;
      margin-left: 10px;
    }
    .mini-flower {
      display: inline-block;
      font-size: 20px;
      line-height: 1;
      flex-shrink: 0;
      margin-right: 120px;
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
      font-size: 0.82rem;
      color: #999;
      font-weight: 600;
      margin-top: 8px;
      margin-bottom: 8px;
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
    .diwali-note {
      position: relative;
      overflow: hidden;
      background: radial-gradient(ellipse at center, #ffffff 40%, #fff9ef 65%, #fff3dc 85%, #ffe8c2 100%);
      border-radius: 14px;
      padding: 20px 16px 16px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(180,140,40,0.1), inset 0 0 30px rgba(255,200,80,0.06);
      animation: holiFadeIn 0.5s ease-out;
    }
    /* ===== WIRES (CSS-based, fixed position) ===== */
    .diwali-wire-left, .diwali-wire-right {
      position: absolute;
      top: 0;
      width: 10px;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }
    .diwali-wire-left  { left: 4px; }
    .diwali-wire-right { right: 4px; }
    /* Thin golden wavy wire — different pattern on each side */
    .diwali-wire-left::after, .diwali-wire-right::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: 10px;
      left: 0;
    }
    /* Left wire: tight zigzag pattern */
    .diwali-wire-left::after {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='24'%3E%3Cpath d='M5 0 L8 6 L3 12 L8 18 L5 24' fill='none' stroke='%23c9a84c' stroke-width='0.8'/%3E%3C/svg%3E");
      background-repeat: repeat-y;
      background-size: 10px 24px;
    }
    /* Right wire: same zigzag pattern */
    .diwali-wire-right::after {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='24'%3E%3Cpath d='M5 0 L8 6 L3 12 L8 18 L5 24' fill='none' stroke='%23c9a84c' stroke-width='0.8'/%3E%3C/svg%3E");
      background-repeat: repeat-y;
      background-size: 10px 24px;
    }

    /* LED bulb wrapper */
    .diwali-note .led {
      position: absolute;
      width: 10px;
      height: 14px;
      pointer-events: none;
      z-index: 1;
    }
    /* Left LEDs hang tilted toward right */
    .diwali-note .led.led-left  { transform: rotate(-20deg); transform-origin: top right; }
    /* Right LEDs hang tilted toward left */
    .diwali-note .led.led-right { transform: rotate(20deg); transform-origin: top left; }
    /* Connector stub — connects bulb to wire */
    .diwali-note .led .led-conn {
      position: absolute;
      top: 0;
      width: 3px;
      height: 3px;
      background: linear-gradient(180deg, #b89840, #8a7030);
      border-radius: 1px;
    }
    .diwali-note .led.led-left .led-conn  { right: 0; }
    .diwali-note .led.led-right .led-conn { left: 0; }
    /* Metal base cap */
    .diwali-note .led .led-cap {
      position: absolute;
      top: 2px;
      width: 6px;
      height: 3px;
      background: linear-gradient(180deg, #d4d4d4, #999);
      border-radius: 1px 1px 2px 2px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
    }
    .diwali-note .led.led-left .led-cap  { right: -1px; }
    .diwali-note .led.led-right .led-cap { left: -1px; }
    /* Glass bulb body */
    .diwali-note .led .led-bulb {
      position: absolute;
      top: 4px;
      width: 7px;
      height: 9px;
      border-radius: 2px 2px 50% 50%;
      background: var(--led-glass);
      box-shadow: 0 0 3px 1px var(--led-glow-soft);
      overflow: hidden;
    }
    .diwali-note .led.led-left .led-bulb  { right: -1px; }
    .diwali-note .led.led-right .led-bulb { left: -1px; }
    /* Glass highlight */
    .diwali-note .led .led-bulb::before {
      content: '';
      position: absolute;
      top: 1px; left: 1px;
      width: 3px; height: 4px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
    }
    /* Inner glow core */
    .diwali-note .led .led-core {
      position: absolute;
      top: 6px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--led-color);
      box-shadow: 0 0 4px 2px var(--led-glow), 0 0 10px 4px var(--led-glow-soft);
    }
    .diwali-note .led.led-left .led-core  { right: 0; }
    .diwali-note .led.led-right .led-core { left: 0; }

    /* Left wire LEDs — connector right edge at left:9px (wire position) */
    .diwali-note .led.l1 { --led-color: #ffb300; --led-glow: rgba(255,179,0,0.7); --led-glow-soft: rgba(255,179,0,0.2); --led-glass: rgba(255,179,0,0.15); top: 6px; left: 0px; }
    .diwali-note .led.l2 { --led-color: #ff7043; --led-glow: rgba(255,112,67,0.7); --led-glow-soft: rgba(255,112,67,0.2); --led-glass: rgba(255,112,67,0.12); top: 28%; left: 0px; }
    .diwali-note .led.l3 { --led-color: #ffd54f; --led-glow: rgba(255,213,79,0.7); --led-glow-soft: rgba(255,213,79,0.2); --led-glass: rgba(255,213,79,0.12); top: 55%; left: 0px; }
    .diwali-note .led.l4 { --led-color: #ff8a65; --led-glow: rgba(255,138,101,0.7); --led-glow-soft: rgba(255,138,101,0.2); --led-glass: rgba(255,138,101,0.12); bottom: 6px; left: 0px; }
    /* Right wire LEDs — connector left edge at right:9px (wire position) */
    .diwali-note .led.l5 { --led-color: #ff9800; --led-glow: rgba(255,152,0,0.7); --led-glow-soft: rgba(255,152,0,0.2); --led-glass: rgba(255,152,0,0.12); top: 6px; right: 0px; }
    .diwali-note .led.l6 { --led-color: #ffca28; --led-glow: rgba(255,202,40,0.7); --led-glow-soft: rgba(255,202,40,0.2); --led-glass: rgba(255,202,40,0.12); top: 28%; right: 0px; }
    .diwali-note .led.l7 { --led-color: #ffe082; --led-glow: rgba(255,224,130,0.7); --led-glow-soft: rgba(255,224,130,0.2); --led-glass: rgba(255,224,130,0.12); top: 55%; right: 0px; }
    .diwali-note .led.l8 { --led-color: #ffab40; --led-glow: rgba(255,171,64,0.7); --led-glow-soft: rgba(255,171,64,0.2); --led-glass: rgba(255,171,64,0.12); bottom: 6px; right: 0px; }
    .diwali-title-row {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .diwali-title {
      position: relative;
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #b8860b;
      background: linear-gradient(
        90deg,
        #f5d328ff 0%,
        #e2b93b 30%,
        #e2b93b 40%,
        #c5991a 45%,
        #c5991a 50%,
        #a77d15ff 55%,
        #c5991a 60%,
        #b4840dff 65%,
        #a37c1aff 100%
      );
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      
      text-shadow: none;
    }
    @keyframes passRoyaleShine {
      0%   { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }

    /* ===== SVG DIYA ===== */
    .mini-diya {
      position: relative;
      width: 28px;
      height: 24px;
      flex-shrink: 0;
    }
    .mini-diya svg {
      width: 100%;
      height: 100%;
      overflow: visible;
      filter: drop-shadow(0 1px 2px rgba(80,40,0,0.25));
    }
    .mini-diya .diya-flame-g {
      animation: diyaFlicker 0.4s infinite alternate ease-in-out;
      transform-origin: 28px 8px;
    }
    @keyframes diyaFlicker {
      0%   { transform: scaleY(1) scaleX(1); opacity: 1; }
      25%  { transform: scaleY(1.15) scaleX(0.93); opacity: 0.94; }
      50%  { transform: scaleY(0.94) scaleX(1.05); opacity: 1; }
      75%  { transform: scaleY(1.12) scaleX(0.96); opacity: 0.92; }
      100% { transform: scaleY(0.97) scaleX(1.03); opacity: 0.95; }
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
        <div class="splash s1"><svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg"><path d="M60 10 C75 5, 95 15, 100 35 C108 55, 95 75, 80 85 C65 95, 40 98, 25 85 C10 72, 5 50, 15 30 C22 15, 45 12, 60 10Z" fill="#ff1744"/><circle cx="105" cy="20" r="5" fill="#ff1744"/><circle cx="15" cy="90" r="4" fill="#ff1744"/><circle cx="95" cy="80" r="3.5" fill="#ff1744"/><ellipse cx="8" cy="45" rx="4" ry="3" fill="#ff1744"/><circle cx="110" cy="55" r="3" fill="#ff1744"/></svg></div>
        <div class="splash s2"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 8 C70 3, 88 20, 90 40 C93 60, 80 80, 60 88 C40 95, 18 82, 12 62 C6 42, 20 18, 50 8Z" fill="#ff9100"/><circle cx="92" cy="25" r="4" fill="#ff9100"/><circle cx="8" cy="75" r="3.5" fill="#ff9100"/><circle cx="75" cy="92" r="3" fill="#ff9100"/><ellipse cx="18" cy="20" rx="3" ry="4" fill="#ff9100"/></svg></div>
        <div class="splash s3"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M45 10 C65 5, 85 18, 88 38 C92 58, 78 78, 58 85 C38 92, 15 78, 10 58 C5 38, 25 15, 45 10Z" fill="#ffea00"/><circle cx="90" cy="22" r="4" fill="#ffea00"/><circle cx="12" cy="82" r="3" fill="#ffea00"/><circle cx="80" cy="85" r="3.5" fill="#ffea00"/><ellipse cx="5" cy="40" rx="3" ry="4" fill="#ffea00"/></svg></div>
        <div class="splash s4"><svg viewBox="0 0 110 105" xmlns="http://www.w3.org/2000/svg"><path d="M55 8 C75 2, 98 18, 102 40 C106 62, 90 82, 70 90 C50 98, 22 88, 12 68 C2 48, 18 20, 55 8Z" fill="#00e676"/><circle cx="100" cy="18" r="5" fill="#00e676"/><circle cx="10" cy="85" r="4" fill="#00e676"/><circle cx="90" cy="88" r="3" fill="#00e676"/><ellipse cx="6" cy="50" rx="3.5" ry="4" fill="#00e676"/><circle cx="105" cy="60" r="3" fill="#00e676"/></svg></div>
        <div class="splash s5"><svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg"><path d="M45 8 C62 3, 80 15, 82 35 C85 55, 72 72, 52 78 C32 84, 12 70, 8 50 C4 30, 22 12, 45 8Z" fill="#2979ff"/><circle cx="82" cy="18" r="3.5" fill="#2979ff"/><circle cx="10" cy="72" r="3" fill="#2979ff"/><circle cx="70" cy="80" r="2.5" fill="#2979ff"/><ellipse cx="5" cy="35" rx="3" ry="3.5" fill="#2979ff"/></svg></div>
        <div class="splash s6"><svg viewBox="0 0 95 95" xmlns="http://www.w3.org/2000/svg"><path d="M48 8 C66 2, 85 16, 88 36 C91 56, 76 76, 56 82 C36 88, 14 74, 10 54 C6 34, 24 14, 48 8Z" fill="#d500f9"/><circle cx="88" cy="20" r="4" fill="#d500f9"/><circle cx="8" cy="78" r="3" fill="#d500f9"/><circle cx="78" cy="82" r="3.5" fill="#d500f9"/><ellipse cx="5" cy="42" rx="3" ry="4" fill="#d500f9"/></svg></div>
        <div class="holi-grain-dot" style="width:3px;height:3px;background:#ff1744;opacity:0.22;top:14%;left:23%;"></div>
        <div class="holi-grain-dot" style="width:4px;height:4px;background:#ffea00;opacity:0.20;top:52%;right:18%;"></div>
        <div class="holi-grain-dot" style="width:2px;height:2px;background:#2979ff;opacity:0.25;top:31%;left:67%;"></div>
        <div class="holi-grain-dot" style="width:3px;height:3px;background:#00e676;opacity:0.20;top:76%;left:14%;"></div>
        <div class="holi-grain-dot" style="width:2px;height:2px;background:#d500f9;opacity:0.24;top:22%;right:31%;"></div>
        <div class="holi-grain-dot" style="width:3px;height:3px;background:#ff9100;opacity:0.18;top:63%;left:39%;"></div>
        <div class="holi-grain-dot" style="width:2px;height:2px;background:#ff0080;opacity:0.22;top:85%;right:27%;"></div>
        <div class="holi-grain-dot" style="width:3px;height:3px;background:#00e5ff;opacity:0.20;top:9%;left:53%;"></div>
        <div class="holi-grain-dot" style="width:2px;height:2px;background:#b388ff;opacity:0.23;top:42%;left:9%;"></div>
        <div class="holi-grain-dot" style="width:3px;height:3px;background:#76ff03;opacity:0.18;top:38%;right:7%;"></div>
        <div class="holi-grain-dot" style="width:2px;height:2px;background:#ffd740;opacity:0.22;top:47%;left:74%;"></div>
        <div class="holi-grain-dot" style="width:3px;height:3px;background:#ff5252;opacity:0.20;top:66%;right:44%;"></div>
        <div class="holi-grain-dot" style="width:2px;height:2px;background:#69f0ae;opacity:0.24;top:29%;left:44%;"></div>
        <div class="holi-grain-dot" style="width:3px;height:3px;background:#ea80fc;opacity:0.19;top:58%;left:82%;"></div>
        <div class="holi-grain-dot" style="width:2px;height:2px;background:#64ffda;opacity:0.22;top:73%;right:58%;"></div>
        <div class="mini-flower">🌸</div>
        <div class="holi-title">Happy Holi!</div>
        <div class="holi-subtitle"><strong>We're closed today on occasion of Holi.</strong></div>
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
        <div class="diwali-wire-left"></div>
        <div class="diwali-wire-right"></div>
        <div class="led led-left l1"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="led led-left l2"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="led led-left l3"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="led led-left l4"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="led led-right l5"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="led led-right l6"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="led led-right l7"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="led led-right l8"><div class="led-conn"></div><div class="led-cap"></div><div class="led-bulb"></div><div class="led-core"></div></div>
        <div class="diwali-title-row">
          <div class="mini-diya"><svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="flameG" cx="50%" cy="65%" r="50%"><stop offset="0%" stop-color="#fff8c4"/><stop offset="20%" stop-color="#ffe44d"/><stop offset="45%" stop-color="#ffb300"/><stop offset="70%" stop-color="#ff8f00"/><stop offset="90%" stop-color="#e65100"/><stop offset="100%" stop-color="transparent"/></radialGradient>
              <linearGradient id="bowlG" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0%" stop-color="#eba84c"/><stop offset="35%" stop-color="#c87828"/><stop offset="70%" stop-color="#a05818"/><stop offset="100%" stop-color="#7a3e10"/></linearGradient>
              <linearGradient id="rimG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#b08030"/><stop offset="30%" stop-color="#eac060"/><stop offset="50%" stop-color="#f5d870"/><stop offset="70%" stop-color="#eac060"/><stop offset="100%" stop-color="#b08030"/></linearGradient>
              <linearGradient id="baseG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a06828"/><stop offset="100%" stop-color="#5c3410"/></linearGradient>
              <filter id="flameGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <!-- Ground shadow -->
            <ellipse cx="13" cy="22.5" rx="11" ry="1.5" fill="rgba(60,30,5,0.13)"/>
            <!-- Base foot -->
            <path d="M6 21 Q6 22.5, 10 22.5 L16 22.5 Q20 22.5, 20 21 Z" fill="url(#baseG)" stroke="#6b3a10" stroke-width="0.3"/>
            <!-- Base ridge -->
            <line x1="9" y1="21.3" x2="17" y2="21.3" stroke="#dab060" stroke-width="0.5" opacity="0.6"/>
            <!-- Bowl — wide, shallow, traditional diya shape -->
            <path d="M3 21 Q1 19, 1 17 Q1 15, 4 14 L22 14 Q24 14.5, 25 16 Q26 14, 28 13.5 Q29 13.5, 28.5 14.5 Q27 16, 25 17 Q24 19, 23 21 Z" fill="url(#bowlG)" stroke="#8b5520" stroke-width="0.3"/>
            <!-- Bowl inner shadow -->
            <path d="M5 20 Q4 18, 5 16 L21 16 Q22 18, 21 20 Z" fill="rgba(0,0,0,0.1)"/>
            <!-- Oil shimmer -->
            <ellipse cx="13" cy="18" rx="6" ry="2" fill="rgba(255,190,60,0.2)"/>
            <!-- Rim — golden ornate edge -->
            <path d="M1 17 Q0.5 15, 2 14 Q4 13, 6 14 L22 14 Q24 13, 25 14 Q26 14, 28 13.5" fill="none" stroke="url(#rimG)" stroke-width="1" stroke-linecap="round"/>
            <!-- Decorative scallops along rim -->
            <circle cx="5" cy="14.2" r="0.5" fill="#f0cc70"/><circle cx="8" cy="13.8" r="0.5" fill="#f0cc70"/><circle cx="11" cy="13.6" r="0.5" fill="#f0cc70"/><circle cx="14" cy="13.6" r="0.5" fill="#f0cc70"/><circle cx="17" cy="13.8" r="0.5" fill="#f0cc70"/><circle cx="20" cy="14" r="0.5" fill="#f0cc70"/>
            <!-- Golden band -->
            <path d="M5 18.5 Q10 18, 13 18.5 Q17 18.5, 21 18.5" fill="none" stroke="#e8c050" stroke-width="0.4" opacity="0.5"/>
            <!-- Kumkum dot -->
            <circle cx="13" cy="17.2" r="0.8" fill="#dd2200"/>
            <!-- Golden dots -->
            <circle cx="9" cy="16.5" r="0.5" fill="#e8c040"/>
            <circle cx="17" cy="16.5" r="0.5" fill="#e8c040"/>
            <!-- Wick -->
            <line x1="27" y1="13.5" x2="29" y2="11" stroke="#3a2a1a" stroke-width="0.5" stroke-linecap="round"/>
            <!-- Flame with glow -->
            <g class="diya-flame-g" filter="url(#flameGlow)"><ellipse cx="29" cy="7" rx="2.5" ry="4.5" fill="url(#flameG)"/></g>
          </svg></div>
          <div class="diwali-title">Happy Diwali!</div>
        </div>
        
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
        tomorrowNotice.innerHTML = `<span class="tn-label"><i class="fa-solid fa-info-circle"></i></span> We will be closed tomorrow on the occasion of Holi.`;
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
        homeItemElement.style.borderColor = '#ff0000';
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
