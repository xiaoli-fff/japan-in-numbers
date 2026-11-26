// main.js — router and control wiring for Japan in Numbers.
// Routes are hash-based so every page works from static files:
//   #/            overview
//   #/population  population
//   #/economy     economy
//   #/regions     regions and prefectures
//   #/education   education
//   #/health      health
//   #/sources     sources and methods
// An unknown route falls back to the overview.

import {
  viewOverview,
  viewPopulation,
  viewEconomy,
  viewRegions,
  viewEducation,
  viewHealth,
  viewSources,
  updateYearStats,
  filterPrefectures,
} from "./views.js";

const ROUTES = {
  "": viewOverview,
  population: viewPopulation,
  economy: viewEconomy,
  regions: viewRegions,
  education: viewEducation,
  health: viewHealth,
  sources: viewSources,
};

const NAV = ["", "population", "economy", "regions", "education", "health", "sources"];
const NAV_LABELS = {
  "": "Overview",
  population: "Population",
  economy: "Economy",
  regions: "Regions",
  education: "Education",
  health: "Health",
  sources: "Sources",
};

function currentRoute() {
  const hash = window.location.hash || "#/";
  const path = hash.replace(/^#\/?/, "").split("?")[0];
  return ROUTES[path] ? path : "";
}

function renderNav(route) {
  const nav = document.getElementById("main-nav");
  nav.innerHTML = NAV.map(
    (r) =>
      `<a href="#/${r}" class="${r === route ? "active" : ""}"${r === route ? ' aria-current="page"' : ""}>${NAV_LABELS[r]}</a>`,
  ).join("");
}

function wireControls(route) {
  if (route === "population") {
    const select = document.getElementById("year-select");
    updateYearStats(2024);
    select.addEventListener("change", () => updateYearStats(Number(select.value)));
  }
  if (route === "economy") {
    const tabs = [...document.querySelectorAll(".tab")];
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.toggle("active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        document.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.hidden = panel.id !== `tab-${tab.dataset.tab}`;
        });
      });
    });
  }
  if (route === "regions") {
    const search = document.getElementById("pref-search");
    const filter = document.getElementById("region-filter");
    filterPrefectures();
    search.addEventListener("input", filterPrefectures);
    filter.addEventListener("change", filterPrefectures);
  }
}

function render() {
  const route = currentRoute();
  document.getElementById("app").innerHTML = ROUTES[route]();
  renderNav(route);
  wireControls(route);
  document.title =
    route === ""
      ? "Japan in Numbers — Official statistics of Japan"
      : `Japan in Numbers — ${NAV_LABELS[route]}`;
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
