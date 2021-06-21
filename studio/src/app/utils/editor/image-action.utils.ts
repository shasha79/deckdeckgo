export interface DeckgoImgAction {
  src: string;
  label: string;
}

export class ImageActionUtils {
  static extractAttributes(image: UnsplashPhoto | TenorGif | StorageFile | Waves | HeritageItem): DeckgoImgAction | undefined {
    if (!image || image === undefined) {
      return undefined;
    }

    if (image.hasOwnProperty('urls')) {
      // Unsplash
      const photo: UnsplashPhoto = image as UnsplashPhoto;

      return {
        src: photo.urls.regular,
        label: photo.description ? photo.description : photo.links && photo.links.html ? photo.links.html : photo.urls.regular,
      };
    } else if (image.hasOwnProperty('media')) {
      // Tenor
      const gif: TenorGif = image as TenorGif;

      if (gif.media && gif.media.length > 0 && gif.media[0].gif) {
        return {
          src: gif.media[0].gif.url,
          label: gif.title,
        };
      }
    } else if (image.hasOwnProperty('downloadUrl')) {
      // Storage image aka image uploaded by the user
      const storageFile: StorageFile = image as StorageFile;

      return {
        src: storageFile.downloadUrl,
        label: storageFile.downloadUrl,
      };
    } else if (image.hasOwnProperty('preview_url')) {
      const heritageItem = image as HeritageItem;
      return {
        src: heritageItem.preview_url,
        label: heritageItem.title,
      };
    }

    return undefined;
  }
}
