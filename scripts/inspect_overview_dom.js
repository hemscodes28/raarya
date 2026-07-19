async function inspectOverviewDom() {
  const url = 'https://www.raarya.com/properties-views/magizh-enclave-/385/';
  const res = await fetch(url);
  const html = await res.text();

  const overviewIdx = html.indexOf('Property Overview');
  if (overviewIdx !== -1) {
    console.log(html.slice(overviewIdx, overviewIdx + 800));
  }
}

inspectOverviewDom().catch(console.error);
