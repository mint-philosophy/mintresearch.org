// Sends Minty along the infrastructure flow map on /guide/.
// Minty follows the drawn connectors: through the fetchers, FeedMe and the
// routing step, down the fork, then splits into one Minty per lane, each
// riding its lane to the final step. Minty waits at the amber steps that wait
// for Seth. The lane ticks are also aligned here with each lane's first step.
(function () {
  "use strict";

  var map = document.querySelector(".flowmap");
  if (!map) return;

  var lanes = Array.prototype.slice.call(map.querySelectorAll(".fm-lane"));

  function box(el) {
    var m = map.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return {
      left: r.left - m.left,
      right: r.right - m.left,
      top: r.top - m.top,
      bottom: r.bottom - m.top,
      cx: (r.left + r.right) / 2 - m.left,
      cy: (r.top + r.bottom) / 2 - m.top,
    };
  }

  // Point each lane's tick at the middle of its first step.
  function alignTicks() {
    lanes.forEach(function (lane) {
      var first = lane.querySelector(".fm-steps > li");
      if (!first) return;
      var l = lane.getBoundingClientRect();
      var f = first.getBoundingClientRect();
      lane.style.setProperty("--fm-tick", Math.round((f.top + f.bottom) / 2 - l.top - 1) + "px");
    });
  }

  alignTicks();
  window.addEventListener("load", alignTicks);

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !map.animate) {
    window.addEventListener("resize", alignTicks);
    return;
  }

  var SPEED = 140; // pixels per second
  var NODE_PAUSE = 350; // milliseconds at each step
  var GATE_PAUSE = 1300; // at a step that waits for Seth
  var END_PAUSE = 900;

  var riders = lanes.map(function () {
    var rider = document.createElement("span");
    rider.className = "fm-minty";
    rider.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.src = "/assets/minty-teal.png";
    img.alt = "";
    rider.appendChild(img);
    map.appendChild(rider);
    return rider;
  });

  // Waypoints are [x, y, pause]. The path runs along the connector lines and
  // through the centre of each step, where the connectors meet.
  function route(lane) {
    var narrow = window.matchMedia("(max-width: 900px)").matches;
    var nodes = Array.prototype.map.call(map.querySelectorAll(".fm-trunk > .fm-node"), box);
    var links = Array.prototype.map.call(map.querySelectorAll(".fm-trunk > .fm-link"), box);
    var fork = box(map.querySelector(".fm-fork"));
    var laneBox = box(lane);
    var steps = Array.prototype.map.call(lane.querySelectorAll(".fm-steps > li"), function (li) {
      var b = box(li);
      b.gate = li.classList.contains("fm-gate");
      return b;
    });
    var busX = laneBox.left - 17;
    var first = steps[0];
    var last = nodes[nodes.length - 1];
    var pts = [];

    if (narrow) {
      var x = links.length ? links[0].left + 1 : nodes[0].left + 25;
      nodes.forEach(function (n) {
        pts.push([x, n.cy, NODE_PAUSE]);
      });
      pts.push([busX, last.cy, 0], [busX, last.bottom, 0]);
    } else {
      var y = links.length ? links[0].top + 1 : nodes[0].cy;
      nodes.forEach(function (n, i) {
        pts.push([i === nodes.length - 1 ? n.cx : n.cx, y, NODE_PAUSE]);
      });
      var forkY = fork.top + 12;
      pts.push([last.cx, last.bottom, 0], [last.cx, forkY, 0], [busX, forkY, 0]);
    }

    var tickY = first.cy;
    pts.push([busX, tickY, 0], [first.left, tickY, 0]);

    steps.forEach(function (s) {
      var pause = s.gate ? GATE_PAUSE : NODE_PAUSE;
      if (narrow) {
        // The narrow layout links steps down their left side.
        var sx = s.left + 19;
        if (s === first) pts.push([sx, first.cy, pause]);
        else pts.push([sx, s.top - 14, 0], [sx, s.cy, pause]);
      } else {
        pts.push([s.cx, s.cy, pause]);
      }
    });
    pts[pts.length - 1][2] = Math.max(pts[pts.length - 1][2], END_PAUSE);
    return pts;
  }

  function animateRider(rider, pts) {
    var times = [0];
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i - 1][0];
      var dy = pts[i][1] - pts[i - 1][1];
      times.push(times[i - 1] + (pts[i - 1][2] || 0) + (Math.hypot(dx, dy) / SPEED) * 1000);
    }
    var lastPt = pts[pts.length - 1];
    var total = times[times.length - 1] + lastPt[2] + 400;
    var frames = [];
    pts.forEach(function (p, i) {
      var pos = "translate(" + p[0].toFixed(1) + "px," + p[1].toFixed(1) + "px)";
      frames.push({ offset: times[i] / total, transform: pos, opacity: i === 0 ? 0 : 1 });
      if (p[2]) frames.push({ offset: (times[i] + p[2]) / total, transform: pos, opacity: 1 });
    });
    frames[1].opacity = 1;
    frames.push({
      offset: 1,
      transform: "translate(" + lastPt[0].toFixed(1) + "px," + lastPt[1].toFixed(1) + "px)",
      opacity: 0,
    });
    return rider.animate(frames, { duration: total, easing: "linear", fill: "forwards" });
  }

  var running = [];
  var timer = null;

  function run() {
    running = riders.map(function (rider, i) {
      return animateRider(rider, route(lanes[i]));
    });
    Promise.all(
      running.map(function (a) {
        return a.finished;
      }),
    ).then(
      function () {
        timer = setTimeout(run, 1200);
      },
      function () {},
    );
  }

  function restart() {
    running.forEach(function (a) {
      a.cancel();
    });
    clearTimeout(timer);
    alignTicks();
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
