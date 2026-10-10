/* Barra10 --------------------------------------------------------------------
   1. Smoke: a small WebGL shader. Rising, domain-warped noise lit from below by
      embers. Rendered at reduced resolution (smoke is soft anyway), paused when
      the tab is hidden, and drawn once, still, for reduced-motion users.
   2. Opening hours: live open/closed status from the hours table.
   3. Header, mobile nav, reveals.
   4. Booking form: writes the request into WhatsApp or an email.
   -------------------------------------------------------------------------- */
;(function () {
  'use strict'

  var root = document.documentElement
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* 1. Smoke ------------------------------------------------------------------ */

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 r;',
    'uniform float t;',
    'uniform float glow;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    '  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);',
    '  for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/r;',
    '  vec2 p=vec2(uv.x*r.x/r.y,uv.y)*1.5;',
    '  float T=t*.03;',
    '  vec2 q=vec2(fbm(p+vec2(0.,-T*2.)),fbm(p+vec2(5.2,1.3-T*2.2)));',
    '  vec2 w=vec2(fbm(p+2.8*q+vec2(1.7,9.2)-vec2(T*.6,T*3.)),fbm(p+2.8*q+vec2(8.3,2.8)-vec2(-T*.4,T*3.4)));',
    '  float s=fbm(p+2.6*w-vec2(0.,T*3.8));',
    '  float rise=smoothstep(1.35,.0,uv.y);',
    '  float wisp=smoothstep(.44,.95,s)*rise;',
    '  vec3 col=vec3(.035,.031,.027);',
    '  col=mix(col,vec3(.27,.245,.225),wisp*.5);',
    '  float g=pow(clamp(1.-uv.y,0.,1.),4.5)*glow;',
    '  float flick=.78+.22*fbm(vec2(uv.x*5.,T*9.));',
    '  col+=vec3(.92,.34,.10)*g*.22*flick;',
    '  col+=vec3(.80,.36,.13)*wisp*g*.85;',
    '  float vig=smoothstep(1.3,.2,length((uv-vec2(.55,.4))*vec2(1.05,1.)));',
    '  col*=.5+.5*vig;',
    '  col+=(h(gl_FragCoord.xy+fract(t))-.5)*.012;',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n')

  var startSmoke = function () {
    var canvas = document.querySelector('[data-smoke]')
    // Only run on a real GPU. Software renderers get a still ember glow instead.
    var gl =
      canvas &&
      canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: true
      })
    var info = gl && gl.getExtension('WEBGL_debug_renderer_info')
    var renderer = gl ? String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)) : ''
    if (!gl || /swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
      root.classList.add('no-smoke')
      return
    }

    var compile = function (type, src) {
      var s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    var vs = compile(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}')
    var fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      root.classList.add('no-smoke')
      return
    }
    var prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    var loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    var uR = gl.getUniformLocation(prog, 'r')
    var uT = gl.getUniformLocation(prog, 't')
    var uGlow = gl.getUniformLocation(prog, 'glow')

    var resize = function () {
      var scale = window.innerWidth < 700 ? 0.4 : 0.5
      var w = Math.min(Math.round(window.innerWidth * scale), 900)
      var h = Math.round(w * (window.innerHeight / window.innerWidth))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uR, w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    // The embers burn brightest under the hero and settle as you read on.
    var glowFor = function () {
      var y = window.scrollY / Math.max(window.innerHeight, 1)
      return Math.max(0.35, 1 - y * 0.65)
    }

    var start = performance.now() - 40000
    var draw = function (now) {
      gl.uniform1f(uT, (now - start) / 1000)
      gl.uniform1f(uGlow, glowFor())
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    draw(performance.now())
    canvas.classList.add('is-live')
    if (reducedMotion) return

    var raf = 0
    var last = 0
    var loop = function (now) {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return // ~30fps is plenty for smoke
      last = now
      draw(now)
    }
    var run = function () {
      cancelAnimationFrame(raf)
      if (document.visibilityState === 'visible') raf = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', run)
    run()
  }

  // Let the page paint first; smoke is atmosphere, not content.
  var whenIdle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 300) }
  window.addEventListener('load', function () {
    whenIdle(startSmoke, { timeout: 1200 })
  })

  /* 2. Opening hours ------------------------------------------------------------ */

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  var mins = function (hhmm) {
    var p = hhmm.split(':')
    return Number(p[0]) * 60 + Number(p[1])
  }

  var hours = {}
  document.querySelectorAll('[data-hours] tr[data-day]').forEach(function (row) {
    var day = Number(row.getAttribute('data-day'))
    var open = row.getAttribute('data-open')
    var close = row.getAttribute('data-close')
    if (!open || !close) return (hours[day] = null)
    var o = mins(open)
    var c = mins(close)
    hours[day] = { open: o, close: c <= o ? c + 1440 : c, from: open, to: close }
  })

  var now = function () {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date())
    var get = function (type) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value
      return ''
    }
    return { day: SHORT.indexOf(get('weekday')), m: Number(get('hour')) * 60 + Number(get('minute')) }
  }

  var describe = function (n) {
    var y = hours[(n.day + 6) % 7]
    if (y && y.close > 1440 && n.m < y.close - 1440) return { open: true, text: 'Open now, until ' + y.to }
    var d = hours[n.day]
    if (d && n.m >= d.open && n.m < d.close) return { open: true, text: 'Open now, until ' + d.to }
    if (d && n.m < d.open) return { open: false, text: 'Opens today at ' + d.from }
    for (var i = 1; i <= 7; i++) {
      var k = (n.day + i) % 7
      if (hours[k]) return { open: false, text: 'Closed. Opens ' + (i === 1 ? 'tomorrow' : DAYS[k]) + ', ' + hours[k].from }
    }
    return { open: false, text: 'Closed' }
  }

  var updateHours = function () {
    var n = now()
    var s = describe(n)
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.setAttribute('data-state', s.open ? 'open' : 'closed')
      el.querySelector('[data-status-text]').textContent = s.text
    })
    document.querySelectorAll('[data-hours] tr[data-day]').forEach(function (row) {
      row.classList.toggle('is-today', Number(row.getAttribute('data-day')) === n.day)
    })
  }
  updateHours()
  setInterval(updateHours, 60000)

  /* 4. Booking form ---------------------------------------------------------------
     No backend: the request is written into a WhatsApp message or an email for the
     guest to send, and the restaurant replies to confirm. */

  var form = document.querySelector('[data-booking]')
  if (form) {
    var WHATSAPP = '447466305313' // VERIFY: from a public listing
    var EMAIL = 'barra10uk@gmail.com'
    var PHONE = '020 8617 0100'
    var SEATING = 90 // minutes a table is held on busy nights; last booking is this long before close
    var STEP = 30

    var f = form.elements
    var message = form.querySelector('[data-booking-message]')
    var sends = form.querySelectorAll('[data-via]')
    var via = 'whatsapp'

    var pad = function (n) {
      return String(n).padStart(2, '0')
    }
    var clock = function (m) {
      return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60)
    }
    var todayInLondon = function () {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
        new Date()
      )
    }
    var asDate = function (value) {
      var p = value.split('-').map(Number)
      return new Date(p[0], p[1] - 1, p[2])
    }
    var say = function (text) {
      message.textContent = text
    }
    var option = function (value, label) {
      var o = document.createElement('option')
      o.value = value
      o.textContent = label
      f.time.appendChild(o)
    }

    var today = todayInLondon()
    f.date.min = today
    var limit = asDate(today)
    limit.setDate(limit.getDate() + 90)
    f.date.max = limit.getFullYear() + '-' + pad(limit.getMonth() + 1) + '-' + pad(limit.getDate())

    var fillTimes = function () {
      var chosen = f.time.value
      f.time.innerHTML = ''
      if (!f.date.value) {
        option('', 'Choose a date first')
        f.time.disabled = true
        return
      }
      var day = hours[asDate(f.date.value).getDay()]
      if (!day) {
        option('', 'Closed that day')
        f.time.disabled = true
        say('We’re closed on Sundays and Mondays. Any day from Tuesday to Saturday works.')
        return
      }
      var earliest = day.open
      if (f.date.value === today) earliest = Math.max(day.open, Math.ceil((now().m + 30) / STEP) * STEP)
      var count = 0
      option('', 'Choose a time')
      for (var t = day.open; t <= day.close - SEATING; t += STEP) {
        if (t < earliest) continue
        option(clock(t), clock(t))
        count++
      }
      if (!count) {
        f.time.innerHTML = ''
        option('', 'No tables left today')
      }
      f.time.disabled = !count
      if (chosen) f.time.value = chosen
      say('')
    }

    var checkGuests = function () {
      var big = f.guests.value === '9+'
      sends.forEach(function (b) {
        b.disabled = big
      })
      say(big ? 'Tables seat up to eight. For a bigger group, please call us on ' + PHONE + '.' : '')
    }

    f.date.addEventListener('change', function () {
      f.date.removeAttribute('aria-invalid')
      fillTimes()
    })
    f.guests.addEventListener('change', checkGuests)
    ;[f.name, f.phone, f.time].forEach(function (el) {
      el.addEventListener('input', function () {
        el.removeAttribute('aria-invalid')
      })
    })
    sends.forEach(function (b) {
      b.addEventListener('click', function () {
        via = b.getAttribute('data-via')
      })
    })

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      if (e.submitter && e.submitter.getAttribute('data-via')) via = e.submitter.getAttribute('data-via')

      var missing = []
      var check = function (el, label) {
        var bad = !el.value.trim()
        el.setAttribute('aria-invalid', String(bad))
        if (bad) missing.push({ el: el, label: label })
      }
      check(f.name, 'your name')
      check(f.phone, 'a contact number')
      check(f.date, 'a date')
      check(f.time, 'a time')
      if (missing.length) {
        var labels = missing.map(function (m) {
          return m.label
        })
        var list = labels.length > 1 ? labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1] : labels[0]
        say('Please add ' + list + '.')
        missing[0].el.focus()
        return
      }

      var date = asDate(f.date.value)
      var longDate = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
      var shortDate = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
      var guests = f.guests.value
      var lines = [
        'Hello Barra10, I’d like to book a table.',
        '',
        'Name: ' + f.name.value.trim(),
        'Guests: ' + guests,
        'Date: ' + longDate,
        'Time: ' + f.time.value,
        'Contact number: ' + f.phone.value.trim()
      ]
      if (f.notes.value.trim()) lines.push('Notes: ' + f.notes.value.trim())
      var text = lines.join('\n')

      if (via === 'email') {
        var subject = 'Table for ' + guests + ', ' + shortDate + ' at ' + f.time.value
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text)
        say('Your email app should open with the request written. Send it and we’ll reply to confirm.')
      } else {
        window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener')
        say('WhatsApp should open with your request written. Send it and we’ll reply to confirm.')
      }
    })

    fillTimes()
  }

  /* 3. Header, nav, photos, reveals ------------------------------------------------ */

  var top = document.querySelector('[data-top]')
  var onScroll = function () {
    top.classList.toggle('is-scrolled', window.scrollY > 40)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  var toggle = document.querySelector('[data-toggle]')
  var nav = document.getElementById('nav')
  var setNav = function (open) {
    toggle.setAttribute('aria-expanded', String(open))
    toggle.textContent = open ? 'Close' : 'Menu'
    nav.classList.toggle('is-open', open)
    document.body.style.overflow = open ? 'hidden' : ''
  }
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

  // A photo that can't load is removed rather than left as an empty frame;
  // if every photo in the reel fails, the reel goes too.
  var reel = document.querySelector('[data-reel]')
  document.querySelectorAll('[data-photo] img').forEach(function (img) {
    var hide = function () {
      img.closest('[data-photo]').hidden = true
      if (reel && !reel.querySelector('[data-photo]:not([hidden])')) reel.hidden = true
    }
    if (img.complete && img.naturalWidth === 0) hide()
    img.addEventListener('error', hide)
  })

  var items = document.querySelectorAll('[data-reveal]')
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    items.forEach(function (el) {
      io.observe(el)
    })
  } else {
    items.forEach(function (el) {
      el.classList.add('is-in')
    })
  }

  var year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())
})()
