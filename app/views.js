// views.js — one render function per page (hash route). Each page is built
// from the numbers in data.js and the SVG builders in charts.js. The
// controls on each page (year selector, tabs, search box, region filter)
// are wired up in main.js after the page is rendered.

import { DATA } from "./data.js";
import { barChart, lineChart, hbarChart, donutChart, COLORS } from "./charts.js";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmt(n, d = 2) {
  return Number(n).toFixed(d);
}

function statCard(value, label, note) {
  return `<div class="stat"><div class="stat-value">${value}</div><div class="stat-label">${label}</div><div class="stat-note">${note}</div></div>`;
}

function sourceLine(text) {
  return `<p class="source">Source: ${text}</p>`;
}

function sectionHead(kicker, title, intro) {
  return `<p class="kicker">${kicker}</p><h1>${title}</h1><p class="lede">${intro}</p>`;
}

// ---------------------------------------------------------------- overview
export function viewOverview() {
  const pop = DATA.populationByYear;
  const latest = pop[pop.length - 1];
  const age = DATA.ageStructure;
  const chart = lineChart(
    pop.map((p) => ({ label: String(p.year).slice(2), value: p.total, valueLabel: fmt(p.total, 1) })),
    { label: "Total population of Japan, 2015 to 2024, millions", axis: (v) => fmt(v, 0) },
  );
  const donut = donutChart(
    age.groups.map((g, i) => ({
      label: g.label,
      value: g.share,
      color: [COLORS.ink, COLORS.teal, COLORS.red][i],
    })),
    { center: "29.3%", centerSub: "aged 65+", label: "Age structure of Japan, 2024" },
  );
  return `
  ${sectionHead("Japan · 日本", "Japan in numbers", "The official statistics of Japan, gathered in one place: how many people live here, how the economy is doing, where they live, what they learn and how long they live. Every figure shows its year and its source.")}
  <div class="stats">
    ${statCard("123.7m", "Total population", "1 October 2024, Statistics Bureau")}
    ${statCard("¥609trn", "Nominal GDP", "2024, Cabinet Office — about $4.0trn")}
    ${statCard("84.0 yrs", "Life expectancy", "2023, Ministry of Health, Labour and Welfare")}
    ${statCard("2.5%", "Unemployment", "2024 average, Labour Force Survey")}
  </div>
  <div class="grid2">
    <section class="card">
      <h2>Population is shrinking</h2>
      <p>Japan's population peaked at 128.08 million in 2008 and has fallen every year since. In 2024 there were 720,988 births and 1,618,684 deaths — a natural decrease of about 898,000 people in a single year.</p>
      ${chart}
      ${sourceLine(DATA.populationNote)}
      <p><a class="btn" href="#/population">Explore population →</a></p>
    </section>
    <section class="card">
      <h2>The world's oldest country</h2>
      <p>Nearly three in ten people in Japan are aged 65 or over — the highest share of any country. The median age is 49.5 years.</p>
      <div class="donut-wrap">${donut}
        <ul class="legend">
          ${age.groups.map((g, i) => `<li><span class="sw" style="background:${[COLORS.ink, COLORS.teal, COLORS.red][i]}"></span>${g.label}: ${fmt(g.millions, 2)}m (${g.share}%)</li>`).join("")}
        </ul>
      </div>
      ${sourceLine("Statistics Bureau of Japan, Population Estimates, 1 October 2024.")}
      <p><a class="btn" href="#/population">Age structure and births →</a></p>
    </section>
  </div>
  <h2>Browse the statistics</h2>
  <div class="cards">
    <a class="card link-card" href="#/population"><h3>Population</h3><p>Ten years of population change, age structure, births and deaths, and a year selector that re-works the figures.</p></a>
    <a class="card link-card" href="#/economy"><h3>Economy</h3><p>GDP, prices, jobs, trade and government debt — with tabs for output, prices and trade.</p></a>
    <a class="card link-card" href="#/regions"><h3>Regions &amp; prefectures</h3><p>All 47 prefectures, grouped into eight regions, with a search box and a region filter that really filter.</p></a>
    <a class="card link-card" href="#/education"><h3>Education</h3><p>Enrolment from primary school to university, and Japan's PISA 2022 results.</p></a>
    <a class="card link-card" href="#/health"><h3>Health</h3><p>Life expectancy over time, infant mortality, doctors and beds, and causes of death.</p></a>
    <a class="card link-card" href="#/sources"><h3>Sources &amp; methods</h3><p>Where every figure comes from, how it was rounded, and what this site is.</p></a>
  </div>
  <section class="card">
    <h2>Japan at a glance</h2>
    <table class="facts">
      <tbody>
        <tr><th>Capital</th><td>Tokyo</td></tr>
        <tr><th>Land area</th><td>377,975 km² (${DATA.country.areaSource})</td></tr>
        <tr><th>Islands</th><td>14,125 (${DATA.country.islandsSource})</td></tr>
        <tr><th>Prefectures</th><td>47</td></tr>
        <tr><th>Currency</th><td>Japanese yen (¥) — about ¥157 per US dollar at the end of 2024</td></tr>
        <tr><th>Time zone</th><td>JST (UTC+9)</td></tr>
        <tr><th>Highest peak</th><td>Mount Fuji, 3,776 m</td></tr>
        <tr><th>Forest cover</th><td>About two-thirds of the land</td></tr>
        <tr><th>Head of government</th><td>${DATA.country.headOfGovernment}</td></tr>
      </tbody>
    </table>
    ${sourceLine("Statistics Bureau of Japan; Geospatial Information Authority of Japan.")}
  </section>`;
}

// -------------------------------------------------------------- population
export function viewPopulation() {
  const pop = DATA.populationByYear;
  const v = DATA.vital;
  const years = pop.map((p) => p.year);
  const chart = lineChart(
    pop.map((p) => ({ label: String(p.year), value: p.total, valueLabel: fmt(p.total, 1) })),
    { label: "Total population of Japan, 2015 to 2024, millions", axis: (x) => fmt(x, 0) },
  );
  const vitalChart = barChart(
    [
      { label: "Births", value: 0.72, valueLabel: "720,988", color: COLORS.teal },
      { label: "Deaths", value: 1.62, valueLabel: "1,618,684", color: COLORS.red },
    ],
    { label: "Births and deaths in Japan, 2024, millions", axis: (x) => fmt(x, 1) },
  );
  return `
  ${sectionHead("Population · 人口", "Population", "Japan's population has fallen every year since its 2008 peak. Pick a year below and the figures update to that year.")}
  <div class="card">
    <label class="control-label" for="year-select">Year</label>
    <select id="year-select" class="control">
      ${years.map((y) => `<option value="${y}"${y === 2024 ? " selected" : ""}>${y}</option>`).join("")}
    </select>
    <div class="stats" id="year-stats"></div>
    <p class="hint" id="year-note"></p>
  </div>
  <div class="grid2">
    <section class="card">
      <h2>Total population, 2015–2024</h2>
      ${chart}
      ${sourceLine(DATA.populationNote)}
    </section>
    <section class="card">
      <h2>Births and deaths, ${v.year}</h2>
      ${vitalChart}
      <p>There were <strong>${v.births.toLocaleString("en-US")}</strong> births and <strong>${v.deaths.toLocaleString("en-US")}</strong> deaths in ${v.year} — a natural decrease of <strong>${Math.abs(v.naturalChange).toLocaleString("en-US")}</strong> people.</p>
      <p>The total fertility rate was <strong>${v.fertilityRate}</strong> children per woman in ${v.year} — ${v.fertilityNote.toLowerCase()}</p>
      ${sourceLine(v.source)}
    </section>
  </div>
  <section class="card">
    <h2>Age structure, ${DATA.ageStructure.year}</h2>
    <div class="donut-wrap">
      ${donutChart(
        DATA.ageStructure.groups.map((g, i) => ({ label: g.label, value: g.share, color: [COLORS.ink, COLORS.teal, COLORS.red][i] })),
        { center: "29.3%", centerSub: "aged 65+", label: "Age structure of Japan, 2024" },
      )}
      <ul class="legend">
        ${DATA.ageStructure.groups.map((g, i) => `<li><span class="sw" style="background:${[COLORS.ink, COLORS.teal, COLORS.red][i]}"></span>${g.label}: ${fmt(g.millions, 2)} million (${g.share}% of the population)</li>`).join("")}
      </ul>
    </div>
    <p>${DATA.ageStructure.oldestShareNote} The median age is <strong>${DATA.ageStructure.medianAge} years</strong> (${DATA.ageStructure.medianAgeSource}).</p>
    ${sourceLine("Statistics Bureau of Japan, Population Estimates, 1 October 2024.")}
  </section>`;
}

// Population year-selector logic, called by main.js after render.
export function updateYearStats(year) {
  const pop = DATA.populationByYear;
  const row = pop.find((p) => p.year === year);
  const first = pop[0];
  const prev = pop.find((p) => p.year === year - 1);
  const el = document.getElementById("year-stats");
  const note = document.getElementById("year-note");
  if (!row || !el) return;
  const changePrev = prev ? row.total - prev.total : 0;
  const changeSince = row.total - first.total;
  el.innerHTML =
    statCard(`${fmt(row.total, 2)}m`, `Total population, ${year}`, "1 October estimate, Statistics Bureau") +
    statCard(`${changePrev <= 0 ? "" : "+"}${fmt(changePrev, 2)}m`, `Change since ${year - 1}`, prev ? "Year-on-year change" : "First year in this series") +
    statCard(`${changeSince <= 0 ? "" : "+"}${fmt(changeSince, 2)}m`, `Change since ${first.year}`, "Compared with the start of the series") +
    statCard(`${fmt((row.total / 377975) * 1000000, 0)}`, "People per km²", "Population density, land area 377,975 km²");
  if (note) {
    note.textContent =
      year === 2024
        ? "2024 is the latest year in the series. The 2020 census counted 126.15 million; the series uses the comparable annual estimates."
        : `Annual estimate for 1 October ${year}, Statistics Bureau of Japan.`;
  }
}

// ---------------------------------------------------------------- economy
export function viewEconomy() {
  const e = DATA.economy;
  const gdpChart = barChart(
    e.gdpNominalYen.map((g) => ({ label: String(g.year), value: g.yen, valueLabel: `¥${g.yen}trn` })),
    { label: "Nominal GDP of Japan, 2019 to 2024, trillion yen", axis: (v) => `¥${fmt(v, 0)}`, highlightLast: true },
  );
  const tradeChart = barChart(
    [
      { label: "Exports", value: e.exportsYen, valueLabel: `¥${e.exportsYen}trn`, color: COLORS.teal },
      { label: "Imports", value: e.importsYen, valueLabel: `¥${e.importsYen}trn`, color: COLORS.red },
    ],
    { label: "Exports and imports of goods, 2024, trillion yen", axis: (v) => `¥${fmt(v, 0)}` },
  );
  const sectorChart = hbarChart(
    e.sectors.map((s) => ({ label: s.label, value: s.share, valueLabel: `${s.share}%` })),
    { label: "Shares of nominal GDP by sector" },
  );
  return `
  ${sectionHead("Economy · 経済", "Economy", "The world's fourth-largest economy by nominal GDP in 2024, with very low unemployment, inflation back above 2%, and the highest government debt ratio of any advanced economy.")}
  <div class="tabs" role="tablist" aria-label="Economy sections">
    <button class="tab active" data-tab="output" role="tab" aria-selected="true">Output</button>
    <button class="tab" data-tab="prices" role="tab" aria-selected="false">Prices &amp; jobs</button>
    <button class="tab" data-tab="trade" role="tab" aria-selected="false">Trade</button>
  </div>
  <section class="card tab-panel" id="tab-output">
    <h2>Gross domestic product</h2>
    <div class="stats">
      ${statCard("¥609trn", "Nominal GDP, 2024", "Cabinet Office — about $4.0 trillion")}
      ${statCard("$32,500", "GDP per person, 2024", "IMF, about")}
      ${statCard("¥157", "Yen per US dollar", "End of 2024, about")}
      ${statCard("39,894", "Nikkei 225", "Close of 2024")}
    </div>
    ${gdpChart}
    ${sourceLine(e.gdpNote)}
    <h3>What the economy is made of</h3>
    ${sectorChart}
    ${sourceLine(e.sectorsSource)}
  </section>
  <section class="card tab-panel" id="tab-prices" hidden>
    <h2>Prices and jobs</h2>
    <div class="stats">
      ${statCard("2.7%", "Consumer price inflation", "2024 average, Statistics Bureau")}
      ${statCard("2.5%", "Unemployment rate", "2024 average, Labour Force Survey")}
      ${statCard("236%", "Government debt", "Share of GDP, 2024, IMF — about")}
    </div>
    <p>Unemployment has stayed near 2.5% for years — low by international standards — while prices rose 2.7% in 2024, the third year in a row above the Bank of Japan's 2% target. Government debt is the highest among advanced economies, at about 236% of GDP, but almost all of it is held at home, in yen.</p>
    ${sourceLine(`${e.unemploymentSource}; ${e.cpiSource}; ${e.debtSource}.`)}
  </section>
  <section class="card tab-panel" id="tab-trade" hidden>
    <h2>Trade in goods, ${e.tradeYear}</h2>
    ${tradeChart}
    <p>Japan exported ¥${e.exportsYen} trillion of goods and imported ¥${e.importsYen} trillion in ${e.tradeYear}, a goods deficit of about ¥${e.importsYen - e.exportsYen} trillion. Cars, machinery and electronics dominate exports.</p>
    ${sourceLine(e.tradeSource)}
    <h3>Where exports go</h3>
    ${hbarChart(e.exportPartners.map((p) => ({ label: p.country, value: p.share, valueLabel: `${p.share}%` })), { label: "Share of Japan's goods exports by destination, 2024" })}
    ${sourceLine(e.exportPartnersSource)}
  </section>`;
}

// ------------------------------------------------------- regions & prefectures
export function regionTotals() {
  return DATA.regions.map((name) => {
    const prefs = DATA.prefectures.filter((p) => p.region === name);
    const total = prefs.reduce((a, p) => a + p.pop, 0);
    return { name, total, count: prefs.length, prefs };
  });
}

export function viewRegions() {
  const regions = regionTotals();
  const chart = hbarChart(
    regions.map((r) => ({ label: r.name, value: +r.total.toFixed(2), valueLabel: `${r.total.toFixed(1)}m` })),
    { label: "Population by region of Japan, 2024, millions", labelWidth: 150 },
  );
  return `
  ${sectionHead("Regions · 地域", "Regions and prefectures", "Japan has 47 prefectures in eight regions. Tokyo alone holds more people than Hokkaido, Tohoku and Shikoku combined. Search the table or filter it by region — both work.")}
  <section class="card">
    <h2>Population by region, 2024</h2>
    ${chart}
    ${sourceLine("Sums of the prefecture estimates below; " + DATA.prefectureSource + ".")}
    <div class="cards">
      ${regions.map((r) => `<div class="card mini"><h3>${r.name}</h3><p class="big">${r.total.toFixed(2)}m people</p><p>${r.count} prefectures · largest: ${r.prefs[0].name} (${r.prefs[0].pop.toFixed(2)}m)</p></div>`).join("")}
    </div>
  </section>
  <section class="card">
    <h2>All 47 prefectures</h2>
    <div class="controls">
      <label class="control-label" for="pref-search">Search</label>
      <input id="pref-search" class="control" type="search" placeholder="Type a prefecture or capital, e.g. Kyoto" autocomplete="off">
      <label class="control-label" for="region-filter">Region</label>
      <select id="region-filter" class="control">
        <option value="">All regions</option>
        ${DATA.regions.map((r) => `<option value="${r}">${r}</option>`).join("")}
      </select>
    </div>
    <p class="hint" id="pref-count"></p>
    <div class="table-wrap">
    <table class="data" id="pref-table">
      <thead><tr><th>Prefecture</th><th>Region</th><th>Capital city</th><th>Population (millions, 2024)</th><th>Share of Japan</th></tr></thead>
      <tbody>
        ${DATA.prefectures.map((p) => `<tr data-name="${p.name.toLowerCase()} ${p.capital.toLowerCase()}" data-region="${p.region}"><td><strong>${p.name}</strong></td><td>${p.region}</td><td>${p.capital}</td><td>${p.pop.toFixed(2)}</td><td>${((p.pop / 123.72) * 100).toFixed(1)}%</td></tr>`).join("")}
      </tbody>
    </table>
    </div>
    ${sourceLine(DATA.prefectureSource + ". Shares use the national total of 123.72 million.")}
  </section>`;
}

// Prefecture table filtering, called by main.js after render.
export function filterPrefectures() {
  const q = (document.getElementById("pref-search").value || "").trim().toLowerCase();
  const region = document.getElementById("region-filter").value;
  const rows = [...document.querySelectorAll("#pref-table tbody tr")];
  let shown = 0;
  rows.forEach((row) => {
    const okQ = !q || row.dataset.name.includes(q);
    const okR = !region || row.dataset.region === region;
    row.style.display = okQ && okR ? "" : "none";
    if (okQ && okR) shown++;
  });
  const count = document.getElementById("pref-count");
  if (count) count.textContent = `Showing ${shown} of 47 prefectures.`;
}

// ---------------------------------------------------------------- education
export function viewEducation() {
  const ed = DATA.education;
  const enrolChart = hbarChart(
    ed.enrolment.map((e) => ({ label: e.level, value: e.pupils, valueLabel: `${e.pupils.toFixed(2)}m` })),
    { label: "Pupils and students by school level, 2024, millions", labelWidth: 210 },
  );
  return `
  ${sectionHead("Education · 教育", "Education", "Nine years of schooling are compulsory in Japan. Almost everyone goes on to high school, and about six in ten school-leavers enter university.")}
  <div class="stats">
    ${statCard("9 years", "Compulsory schooling", "Primary 6 years + lower secondary 3 years")}
    ${statCard(ed.highSchoolAdvancement + "%", "Go on to high school", ed.highSchoolYear + ", MEXT")}
    ${statCard(ed.universityAdvancement + "%", "Enter university", ed.universityYear + ", MEXT")}
    ${statCard(ed.spendingShare, "Public education spending", "Share of GDP, OECD")}
  </div>
  <div class="grid2">
    <section class="card">
      <h2>Who is in school, ${ed.highSchoolYear}</h2>
      ${enrolChart}
      ${sourceLine(ed.enrolmentSource)}
      <table class="data">
        <thead><tr><th>Level</th><th>Years</th><th>Pupils / students</th></tr></thead>
        <tbody>
          ${ed.enrolment.map((e) => `<tr><td>${e.level}</td><td>${e.years}</td><td>${e.pupils.toFixed(2)} million</td></tr>`).join("")}
        </tbody>
      </table>
    </section>
    <section class="card">
      <h2>PISA 2022 — Japan among OECD countries</h2>
      <p>Japan's 15-year-olds scored near the top of the OECD in all three subjects tested by the OECD's PISA study.</p>
      <table class="data">
        <thead><tr><th>Subject</th><th>OECD rank</th><th>Mean score</th></tr></thead>
        <tbody>
          ${ed.pisa.map((p) => `<tr><td>${p.subject}</td><td>${p.rank}</td><td>${p.score}</td></tr>`).join("")}
        </tbody>
      </table>
      ${sourceLine(ed.pisaSource)}
      <p>School is compulsory from age 6 to 15. The school year starts in April, and the school week is five days in public schools.</p>
      ${sourceLine(ed.advancementSource + "; " + ed.spendingSource + ".")}
    </section>
  </div>`;
}

// ------------------------------------------------------------------- health
export function viewHealth() {
  const h = DATA.health;
  const le = DATA.lifeExpectancy;
  const chart = lineChart(
    le.map((p) => ({ label: String(p.year), value: p.women, valueLabel: p.women.toFixed(1) })),
    {
      label: "Life expectancy at birth in Japan, 2015 to 2023, years",
      series: le.map((p) => ({ label: String(p.year), value: p.men })),
      axis: (v) => v.toFixed(0),
    },
  );
  const causes = hbarChart(
    h.causesOfDeath.map((c, i) => ({ label: c.cause, value: c.share, valueLabel: `${c.share}%`, color: i === 0 ? COLORS.red : COLORS.ink })),
    { label: "Causes of death in Japan, 2023, share of all deaths", labelWidth: 230 },
  );
  return `
  ${sectionHead("Health · 健康", "Health", "Japan has one of the longest life expectancies in the world, the lowest infant mortality among large countries, and universal health insurance since 1961.")}
  <div class="stats">
    ${statCard("87.1 yrs", "Life expectancy, women", "2023, MHLW")}
    ${statCard("81.1 yrs", "Life expectancy, men", "2023, MHLW")}
    ${statCard(h.infantMortality + " / 1,000", "Infant mortality", h.infantMortalityYear + ", MHLW")}
    ${statCard(h.doctorsPer1000, "Doctors per 1,000 people", h.oecdYear + ", OECD")}
  </div>
  <div class="grid2">
    <section class="card">
      <h2>Life expectancy at birth</h2>
      ${chart}
      <p class="legend-line"><span class="sw" style="background:${COLORS.ink}"></span> Women &nbsp; <span class="sw" style="background:${COLORS.red}"></span> Men</p>
      <p>Life expectancy dipped in 2021–2022, during the pandemic, then steadied in 2023: 87.14 years for women and 81.09 for men.</p>
      ${sourceLine(DATA.lifeExpectancySource + ".")}
    </section>
    <section class="card">
      <h2>What people die of, ${h.causesYear}</h2>
      ${causes}
      ${sourceLine(h.causesSource)}
    </section>
  </div>
  <section class="card">
    <h2>The health system in brief</h2>
    <p>${h.universalNote} Everyone belongs to a public insurance scheme, and patients typically pay 30% of the cost of care at the point of use, with monthly caps. Japan has ${h.bedsPer1000} hospital beds per 1,000 people (${h.oecdYear}, OECD) — far more than most OECD countries — and spends ${h.spendingShare} of GDP on health (${h.spendingYear}, OECD).</p>
    ${sourceLine(h.oecdSource + "; " + h.spendingSource + ".")}
  </section>`;
}

// ------------------------------------------------------------------ sources
export function viewSources() {
  return `
  ${sectionHead("Sources · 出典", "Sources and methods", "Every figure on this site names its year and its source on the page where it appears. This page collects them all, and explains how the numbers were handled.")}
  <section class="card">
    <h2>Sources</h2>
    <table class="data">
      <thead><tr><th>Publisher</th><th>What was used</th></tr></thead>
      <tbody>
        ${DATA.sources.map((s) => `<tr><td><strong>${s.name}</strong></td><td>${s.what}</td></tr>`).join("")}
      </tbody>
    </table>
  </section>
  <section class="card">
    <h2>Methods</h2>
    <ul class="methods">
      <li>Population figures are the Statistics Bureau's 1 October estimates. The 2020 census counted 126.15 million people; the population series on this site uses the comparable annual estimates (125.71 million for 2020) so the years can be compared like with like.</li>
      <li>Prefecture populations are rounded to two decimal places in millions. Region totals are the sums of their prefectures' figures, so the regions add up to the prefectures shown.</li>
      <li>Money figures are nominal (not adjusted for inflation) unless the page says otherwise. Yen figures are in trillion yen; dollar figures are the IMF's conversions.</li>
      <li>Shares are rounded, so they may not add to exactly 100%.</li>
      <li>Figures are those published for the years shown. This site was put together in November 2026; where a 2025 or 2026 figure had not been published yet, the latest published year is used and labelled.</li>
    </ul>
  </section>
  <section class="card">
    <h2>About this site</h2>
    <p><strong>Japan in Numbers</strong> is an independent site built for people looking up Japan's statistics. It is not affiliated with the Statistics Bureau of Japan or any government body, and it copies no other site's design, text or images. All charts are drawn from the figures on this page's data file, and the whole site runs offline from its own files — it makes no network requests.</p>
    <p>Spot a figure that looks wrong? Check it against the source named beside it — the source, not this site, is the authority.</p>
  </section>`;
}
