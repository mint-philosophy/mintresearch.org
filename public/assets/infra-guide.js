(function () {
  "use strict";

  var SNAPSHOT_URL = "/assets/minty/infra-snapshot.json";

  function getPath(object, path) {
    return path.split(".").reduce(function (value, key) {
      return value == null ? undefined : value[key];
    }, object);
  }

  function formatValue(value, format) {
    if (value == null) return "";
    if (format === "number") return Number(value).toLocaleString("en-US");
    if (format === "approx") return "~" + Number(value).toLocaleString("en-US");
    if (format === "date") {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(value));
    }
    return String(value);
  }

  function bindFields(snapshot) {
    document.querySelectorAll("[data-infra-field]").forEach(function (element) {
      var value = getPath(snapshot, element.dataset.infraField);
      if (value == null || value === "") return;
      element.textContent = formatValue(value, element.dataset.infraFormat);
    });
  }

  function renderDaemonInventory(snapshot) {
    var container = document.getElementById("infraDaemonInventory");
    if (!container) return;

    var services = snapshot.fleet.services || [];
    var fragment = document.createDocumentFragment();
    services.forEach(function (service) {
      var row = document.createElement("tr");

      var name = document.createElement("td");
      var code = document.createElement("code");
      code.textContent = service.name;
      name.appendChild(code);

      var purpose = document.createElement("td");
      purpose.textContent = service.description;

      var schedule = document.createElement("td");
      schedule.textContent = service.schedule;

      var state = document.createElement("td");
      var marker = document.createElement("span");
      marker.className = service.loaded ? "health-ok" : "health-muted";
      marker.textContent = "\u25cf";
      marker.setAttribute("aria-hidden", "true");
      state.appendChild(marker);
      state.appendChild(
        document.createTextNode(" " + (service.loaded ? "Loaded" : service.status))
      );

      row.appendChild(name);
      row.appendChild(purpose);
      row.appendChild(schedule);
      row.appendChild(state);
      fragment.appendChild(row);
    });

    container.replaceChildren(fragment);
  }

  function renderCorpusStats(snapshot) {
    window.__mintStats = Object.assign({}, window.__mintStats || {}, {
      paperCount: snapshot.corpus.paperCount,
      chunkCount: snapshot.corpus.chunkCount,
      clusterCount: snapshot.corpus.clusterCount,
      lancedbSizeGB: snapshot.corpus.lancedbSizeGB,
      semanticQuestionCount: snapshot.corpus.semanticQuestionCount,
      subscriberCount: snapshot.newsletter.enabledSubscribers,
    });
  }

  function applySnapshot(snapshot) {
    bindFields(snapshot);
    renderDaemonInventory(snapshot);
    renderCorpusStats(snapshot);
    document.documentElement.dataset.infraSnapshot = "ready";
  }

  fetch(SNAPSHOT_URL, { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Infrastructure snapshot request failed: " + response.status);
      }
      return response.json();
    })
    .then(applySnapshot)
    .catch(function (error) {
      document.documentElement.dataset.infraSnapshot = "fallback";
      console.warn(error);
    });
})();
