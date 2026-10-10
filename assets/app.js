/* Barra10: small enhancements. Everything still works without this file. */
;(function () {
  'use strict'

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  /* Opening hours: the table in index.html is the only place they are set. */

  var minutes = function (hhmm) {
    var p = hhmm.split(':')
    return Number(p[0]) * 60 + Number(p[1])
  }

  var hours = {}
  document.querySelectorAll('[data-hours] tr[data-day]').forEach(function (row) {
    var open = row.getAttribute('data-open')
    var close = row.getAttribute('data-close')
    var day = Number(row.getAttribute('data-day'))
    if (!open || !close) return (hours[day] = null)
    var o = minutes(open)
    var c = minutes(close)
    hours[day] = { open: o, close: c <= o ? c + 1440 : c, from: open, to: close }
  })

  var londonNow = function () {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date())
    var get = function (t) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value
      return ''
    }
    return { day: SHORT.indexOf(get('weekday')), mins: Number(get('hour')) * 60 + Number(get('minute')) }
  }

  var describe = function (now) {
    var y = hours[(now.day + 6) % 7]
    if (y && y.close > 1440 && now.mins < y.close - 1440) return { open: true, text: 'Open now, until ' + y.to }
    var t = hours[now.day]
    if (t && now.mins >= t.open && now.mins < t.close) return { open: true, text: 'Open now, until ' + t.to }
    if (t && now.mins < t.open) return { open: false, text: 'Opens today at ' + t.from }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7
      if (hours[d]) return { open: false, text: 'Closed now. Back ' + (i === 1 ? 'tomorrow' : DAYS[d]) + ' at ' + hours[d].from }
    }
    return { open: false, text: 'Closed' }
  }

  var update = function () {
    var now = londonNow()
    var s = describe(now)
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.setAttribute('data-state', s.open ? 'open' : 'closed')
      el.querySelector('[data-status-text]').textContent = s.text
    })
    document.querySelectorAll('[data-hours] tr[data-day]').forEach(function (row) {
      row.classList.toggle('is-today', Number(row.getAttribute('data-day')) === now.day)
    })
  }

  update()
  setInterval(update, 60000)

  /* Slim top bar once the sign has scrolled away. */
  var bar = document.querySelector('[data-bar]')
  var sign = document.getElementById('top')
  if (bar && sign && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        bar.classList.toggle('is-shown', !entries[0].isIntersecting)
      },
      { threshold: 0.15 }
    ).observe(sign)
  }

  var year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())
})()
