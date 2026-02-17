const UNSPLASH_ACCESS_KEY = "B3VojkL-WAwdHLbXF1IG5bgSPmBft1JUnOZYqUMfXPw";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=400&fit=crop";

export const fetchDestinationImage = async (query: string): Promise<string> => {
  console.log('🖼️ Fetching image for:', query);

  if (!UNSPLASH_ACCESS_KEY || !query.trim()) {
    console.log('❌ No API key or empty query, using fallback');
    return FALLBACK_IMAGE;
  }

  try {
    const params = new URLSearchParams({
      query: query.trim(),
      orientation: "landscape",
      per_page: "1",
      client_id: UNSPLASH_ACCESS_KEY,
    });

    const url = `https://api.unsplash.com/search/photos?${params.toString()}`;
    console.log('📡 Calling Unsplash API:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Unsplash API error:", response.status);
      return FALLBACK_IMAGE;
    }

    const data = await response.json();
    console.log('📦 API Response:', data.total, 'results found');

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls?.regular || FALLBACK_IMAGE;
      console.log('✅ Using image:', imageUrl);
      return imageUrl;
    }

    console.log('⚠️ No results, using fallback');
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error("Failed to fetch destination image:", error);
    return FALLBACK_IMAGE;
  }
};
