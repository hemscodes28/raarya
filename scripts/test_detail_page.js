async function testDetail() {
  const url = 'https://www.raarya.com/properties-views/dtcp---rera-approved-plots-in-coimbatore---premium-layout/23/';
  console.log('Fetching detail page:', url);
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length:', html.length);

  // Extract all img srcs
  const imgMatches = html.match(/src=["']([^"']+)["']/g) || [];
  const uploadImgs = imgMatches
    .map(m => m.replace(/src=["']/, '').replace(/["']/, ''))
    .filter(src => src.includes('uploads') || src.includes('project_image'));

  console.log('Upload Images:', uploadImgs);

  // Search for text content / details / description
  const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Find main section
  const mainMatch = cleanText.match(/<section[\s\S]*?<\/section>/gi);
  console.log('Found sections count:', mainMatch ? mainMatch.length : 0);
  if (mainMatch) {
    mainMatch.forEach((sec, i) => {
      if (sec.includes('Description') || sec.includes('Overview') || sec.includes('Amenities') || sec.includes('Property')) {
        console.log(`--- SECTION ${i} ---`);
        console.log(sec.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500));
      }
    });
  }
}

testDetail().catch(console.error);
