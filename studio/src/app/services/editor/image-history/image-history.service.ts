import {get, set, del} from 'idb-keyval';

export class ImageHistoryService {
  private static instance: ImageHistoryService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!ImageHistoryService.instance) {
      ImageHistoryService.instance = new ImageHistoryService();
    }
    return ImageHistoryService.instance;
  }

  clear(): Promise<void> {
    return del('deckdeckgo_images');
  }

  async push(image: UnsplashPhoto | TenorGif | StorageFile | HeritageItem) {
    if (!image) {
      return;
    }

    let images: (UnsplashPhoto | TenorGif | StorageFile | HeritageItem)[] = await this.get();

    if (!images) {
      images = [];
    }

    const index: number = images.findIndex((filteredPhoto: UnsplashPhoto | TenorGif | StorageFile | HeritageItem) => {
      if (filteredPhoto.hasOwnProperty('fullPath')) {
        return (filteredPhoto as StorageFile).fullPath === (image as StorageFile).fullPath;
      } else {
        return (filteredPhoto as UnsplashPhoto | TenorGif).id === (image as UnsplashPhoto | TenorGif | HeritageItem).id;
      }
    });

    if (index >= 0) {
      return;
    }

    images.unshift(image);

    if (images.length > 10) {
      images.length = 10;
    }

    await set('deckdeckgo_images', images);
  }

  get(): Promise<(UnsplashPhoto | TenorGif | StorageFile | HeritageItem | HeritageItem)[]> {
    return get('deckdeckgo_images');
  }
}
