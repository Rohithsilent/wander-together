const UNSPLASH_ACCESS_KEY = "B3VojkL-WAwdHLbXF1IG5bgSPmBft1JUnOZYqUMfXPw";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=400&fit=crop";

export const fetchDestinationImage = async (query: string): Promise<string> => {
  if (!UNSPLASH_ACCESS_KEY || !query.trim()) {
    return FALLBACK_IMAGE;
  }

  try {
    const params = new URLSearchParams({
      query: query.trim(),
      orientation: "landscape",
      per_page: "1",
      client_id: UNSPLASH_ACCESS_KEY,
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`
    );

    if (!response.ok) {
      console.error("Unsplash API error:", response.status);
      return FALLBACK_IMAGE;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls?.regular || FALLBACK_IMAGE;
    }

    return FALLBACK_IMAGE;
  } catch (error) {
    console.error("Failed to fetch destination image:", error);
    return FALLBACK_IMAGE;
  }
};
