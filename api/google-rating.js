export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(503).json({
      error: "Google Places configuration is missing",
      rating: null,
      userRatingCount: null
    });
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places/" + encodeURIComponent(placeId), {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,displayName,googleMapsUri"
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Google Places request failed", rating: null, userRatingCount: null });
    }

    const place = await response.json();
    return res.status(200).json({
      rating: typeof place.rating === "number" ? place.rating : null,
      userRatingCount: Number.isFinite(place.userRatingCount) ? place.userRatingCount : null,
      name: place.displayName?.text || "TASVIA Academy",
      googleMapsUri: place.googleMapsUri || "https://maps.app.goo.gl/5K4BYNccQEcCR27E9"
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load Google rating", rating: null, userRatingCount: null });
  }
}