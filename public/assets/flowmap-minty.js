// Sends a small Minty along the infrastructure flow map on /guide/.
// Each trip runs collect -> FeedMe -> route, then down one lane, taking the
// three lanes in turn. Minty pauses at the amber steps that wait for Seth.
(function () {
  "use strict";

  var map = document.querySelector(".flowmap");
  if (!map || !map.animate) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var SPEED = 150; // pixels per second
  var GATE_PAUSE = 900; // milliseconds at a step that waits for Seth
  var STEP_PAUSE = 180;

  var rider = document.createElement("span");
  rider.className = "fm-minty";
  rider.setAttribute("aria-hidden", "true");
  var img = document.createElement("img");
  img.src = "/assets/minty-teal.png";
  img.alt = "";
  rider.appendChild(img);
  map.appendChild(rider);

  var lanes = map.querySelectorAll(".fm-lane");
  var laneIndex = 0;
  var current = null;
  var timer = null;

  function box(el) {
    var m = map.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return {
      left: r.left - m.left,
      right: r.right - m.left,
      top: r.top - m.top,
      bottom: r.bottom - m.top,
      cx: (r.left + r.right) / 2 - m.left,
    };
  }

  // Waypoints are [x, y, pause]; Minty's centre follows them.
  function route(lane) {
    var narrow = window.matchMedia("(max-width: 900px)").matches;
    var nodes = Array.prototype.map.call(
      map.querySelectorAll(".fm-trunk > .fm-node"),
      box,
    );
    var fork = box(map.querySelector(".fm-fork"));
    var steps = lane.querySelectorAll(".fm-steps > li");
    var laneBox = box(lane);
    var busX = laneBox.left - 17;
    var tickY = laneBox.top + 8;
    var pts = [];
    var last = nodes[nodes.length - 1];

    if (narrow) {
      nodes.forEach(function (n) {
        pts.push([n.left, n.top + 6, 0], [n.left, n.bottom, STEP_PAUSE]);
      });
      pts.push([busX, last.bottom + 2, 0]);
    } else {
      nodes.forEach(function (n, i) {
        pts.push([n.left + (i ? 0 : 12), n.bottom, 0]);
        pts.push([i === nodes.length - 1 ? n.cx : n.right, n.bottom, STEP_PAUSE]);
      });
      pts.push([last.cx, fork.top + 14, 0], [busX, fork.top + 14, 0]);
    }
    pts.push([busX, tickY, 0], [laneBox.left, tickY, 0]);

    Array.prototype.forEach.call(steps, function (li, i) {
      var s = box(li);
      var pause = li.classList.contains("fm-gate") ? GATE_PAUSE : STEP_PAUSE;
      if (narrow) {
        pts.push([s.left, s.top + 2, 0], [s.left, s.top + (s.bottom - s.top) / 2, pause]);
        if (i === steps.length - 1) pts.push([s.left, s.bottom, 0]);
      } else {
        pts.push([s.left + 12, s.top, 0], [s.cx, s.top, pause]);
        if (i === steps.length - 1) pts.push([s.right - 10, s.top, 0]);
      }
    });
    return pts;
  }

  function run() {
    if (!lanes.length) return;
    var pts = route(lanes[laneIndex]);
    laneIndex = (laneIndex + 1) % lanes.length;

    // Turn distances and pauses into a timeline.
    var times = [0];
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i - 1][0];
      var dy = pts[i][1] - pts[i - 1][1];
      var t = times[i - 1] + (pts[i - 1][2] || 0) + (Math.hypot(dx, dy) / SPEED) * 1000;
      times.push(t);
    }
    var frames = [];
    var total = times[times.length - 1] + 400;
    pts.forEach(function (p, i) {
      var pos = "translate(" + p[0].toFixed(1) + "px," + p[1].toFixed(1) + "px)";
      frames.push({ offset: times[i] / total, transform: pos, opacity: i === 0 ? 0 : 1 });
      if (p[2]) frames.push({ offset: (times[i] + p[2]) / total, transform: pos, opacity: 1 });
    });
    var end = pts[pts.length - 1];
    frames[1].opacity = 1;
    frames.push({
      offset: 1,
      transform: "translate(" + end[0].toFixed(1) + "px," + end[1].toFixed(1) + "px)",
      opacity: 0,
    });

    current = rider.animate(frames, { duration: total, easing: "linear", fill: "forwards" });
    current.onfinish = function () {
      timer = setTimeout(run, 700);
    };
  }

  function restart() {
    if (current) current.cancel();
    clearTimeout(timer);
    laneIndex = 0;
    timer = setTimeout(run, 250);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(restart, 200);
  });

  if (document.readyState === "complete") restart();
  else window.addEventListener("load", restart);
})();
