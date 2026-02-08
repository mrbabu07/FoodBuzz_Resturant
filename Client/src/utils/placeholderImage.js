// Utility for generating placeholder images
// Using placehold.co as a reliable alternative to via.placeholder.com

export const getPlaceholderImage = (
  width = 600,
  height = 400,
  text = "Image",
) => {
  return `https://placehold.co/${width}x${height}/f97316/white?text=${encodeURIComponent(text)}`;
};

export const handleImageError = (e, text = "Image") => {
  // Fallback to a solid color SVG if external service fails
  const svg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${e.target.width || 600}' height='${e.target.height || 400}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%239ca3af'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
  e.currentTarget.src = svg;
};
