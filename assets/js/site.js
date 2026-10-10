/* Barra10: small progressive enhancements. The page works without this file. */
;(function () {
  'use strict'

  var TIME_ZONE = 'Europe/London'
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  /* Opening hours ------------------------------------------------------------
     The hours table in index.html is the single source of truth. */

  var toMinutes = function (hhmm) {
    var p = hhmm.split(':')
    return Number(p[0]) * 60 + Number(p[1])
  }

  var readHours = function () {
    var table = document.querySelector('[data-hours]')
    var hours = {}
    if (!table) return hours
    table.querySelectorAll('tr[data-day]').forEach(function (row) {
      var day = Number(row.getAttribute('data-day'))
      var open = row.getAttribute('data-open')
      var close = row.getAttribute('data-close')
      if (!open || !close) {
        hours[day] = null
        return
      }
      var o = toMinutes(open)
      var c = toMinutes(close)
      hours[day] = { open: o, close: c <= o ? c + 1440 : c, openText: open, closeText: close, row: row }
    })
    return hours
  }

  var londonNow = function () {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date())
    var get = function (type) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value
      return ''
    }
    return { day: SHORT.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
  }

  var status = function (hours, now) {
    var yesterday = hours[(now.day + 6) % 7]
    if (yesterday && yesterday.close > 1440 && now.minutes < yesterday.close - 1440) {
      return { open: true, text: 'Open now · until ' + yesterday.closeText }
    }
    var today = hours[now.day]
    if (today && now.minutes >= today.open && now.minutes < today.close) {
      return { open: true, text: 'Open now · until ' + today.closeText }
    }
    if (today && now.minutes < today.open) {
      return { open: false, text: 'Opens today at ' + today.openText }
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7
      if (hours[d]) {
        var when = i === 1 ? 'tomorrow' : DAYS[d]
        return { open: false, text: 'Closed now · opens ' + when + ' at ' + hours[d].openText }
      }
    }
    return { open: false, text: 'Closed' }
  }

  var updateStatus = function () {
    var hours = readHours()
    var now = londonNow()
    var s = status(hours, now)
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.setAttribute('data-state', s.open ? 'open' : 'closed')
      var text = el.querySelector('[data-status-text]')
      if (text) text.textContent = s.text
    })
    document.querySelectorAll('[data-hours] tr').forEach(function (row) {
      row.classList.toggle('is-today', Number(row.getAttribute('data-day')) === now.day)
    })
  }

  updateStatus()
  setInterval(updateStatus, 60 * 1000)

  /* Header -------------------------------------------------------------------- */

  var masthead = document.querySelector('[data-masthead]')
  var onScroll = function () {
    if (masthead) masthead.classList.toggle('is-scrolled', window.scrollY > 8)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  var toggle = document.querySelector('[data-nav-toggle]')
  var nav = document.getElementById('site-nav')
  var setNav = function (open) {
    if (!toggle || !nav) return
    toggle.setAttribute('aria-expanded', String(open))
    nav.classList.toggle('is-open', open)
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true')
    })
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false)
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false)
        toggle.focus()
      }
    })
  }

  // Highlight the nav link for the section in view.
  if ('IntersectionObserver' in window && nav) {
    var links = {}
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a
    })
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = links[entry.target.id]
          if (!link) return
          if (entry.isIntersecting) {
            Object.keys(links).forEach(function (k) {
              links[k].removeAttribute('aria-current')
            })
            link.setAttribute('aria-current', 'true')
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id)
      if (section) spy.observe(section)
    })
  }

  /* Photos: show the designed fallback if an image can't load ---------------- */

  document.querySelectorAll('.photo img').forEach(function (img) {
    var fail = function () {
      img.closest('.photo').classList.add('is-missing')
    }
    if (img.complete && img.naturalWidth === 0) fail()
    img.addEventListener('error', fail)
  })

  /* Map: only load Google Maps when asked ---------------------------------------- */

  var mapButton = document.querySelector('[data-map-load]')
  if (mapButton) {
    mapButton.addEventListener('click', function () {
      var frame = document.createElement('iframe')
      frame.src =
        'https://www.google.com/maps?q=' +
        encodeURIComponent('Barra10, Broadway Market, Tooting High Street, London SW17 0RL') +
        '&output=embed'
      frame.title = 'Map showing Barra10 in Broadway Market, Tooting'
      frame.loading = 'lazy'
      frame.referrerPolicy = 'no-referrer-when-downgrade'
      mapButton.replaceWith(frame)
    })
  }

  /* Reveal on scroll ------------------------------------------------------------- */

  var revealables = document.querySelectorAll('[data-reveal]')
  if ('IntersectionObserver' in window) {
    var reveal = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            reveal.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    revealables.forEach(function (el) {
      reveal.observe(el)
    })
  } else {
    revealables.forEach(function (el) {
      el.classList.add('is-in')
    })
  }

  var year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())
})()
