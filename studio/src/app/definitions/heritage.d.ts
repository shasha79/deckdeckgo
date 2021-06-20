interface HeritageItemLocation {
  lat: number,
  lon: number,
  label?: string;
}

interface HeritageItem {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  preview_url?: string;
  image_url?: string;
  type?: string;
  tags?: string[];
  rights?: string;

  location?: HeritageItemLocation[];

}

interface HeritageItemSearchResponse {
  results: HeritageItem[];
}
