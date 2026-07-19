async function inspectSinglePage() {
  const url = 'https://www.raarya.com/properties-views/magizh-enclave-/385/';
  const res = await fetch(url);
  const html = await res.text();

  // Find images in swiper / slider
  const sliderImgs = [...html.matchAll(/src=["']([^"']*(?:project_image|project_slider_images)[^"']*)["']/gi)].map(m => m[1]);
  console.log('SLIDER IMAGES:', Array.from(new Set(sliderImgs)));

  // Extract description block
  const descBlock = html.match(/<div class=["']single-property-element[^"']*["']>([\s\S]*?)<\/div>/gi) ||
                    html.match(/<div class=["'][^"']*desc[^"']*["']>([\s\S]*?)<\/div>/gi) ||
                    html.match(/<div class=["'][^"']*property-description[^"']*["']>([\s\S]*?)<\/div>/gi);

  console.log('DESC BLOCKS FOUND:', descBlock ? descBlock.length : 0);
  if (descBlock) {
    descBlock.forEach((b, i) => console.log(`BLOCK ${i+1}:\n`, b.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300)));
  }

  // Print text content inside main wrapper/container
  const mainContent = html.match(/<div id=["']wrapper["']>([\s\S]*?)<footer/i);
  if (mainContent) {
    const textOnly = mainContent[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('\n--- MAIN CONTAINER TEXT SAMPLE ---');
    console.log(textOnly.slice(0, 1500));
  }
}

inspectSinglePage().catch(console.error);
