import {Component, Element, Listen, State, h} from '@stencil/core';

import i18n from '../../../stores/i18n.store';

import {HeritageService} from '../../../services/heritage/heritage.service';

import {ImageHistoryService} from '../../../services/editor/image-history/image-history.service';

@Component({
  tag: 'app-heritage',
  styleUrl: 'app-heritage.scss',
})
export class AppHeritage {
  @Element() el: HTMLElement;

  private heritageService: HeritageService;
  private imageHistoryService: ImageHistoryService;

  @State()
  private photosOdd: HeritageItem[];

  @State()
  private photosEven: HeritageItem[];

  @State()
  private searchTerm: string;

  private previousSearchTerm: string;

  @State()
  private disableInfiniteScroll = false;

  private paginationNext: number = 1;

  @State()
  private searching: boolean = false;

  constructor() {
    this.heritageService = HeritageService.getInstance();
    this.imageHistoryService = ImageHistoryService.getInstance();
  }

  async componentDidLoad() {
    history.pushState({modal: true}, null);
  }

  @Listen('popstate', {target: 'window'})
  async handleHardwareBackButton(_e: PopStateEvent) {
    await this.closeModal();
  }

  async closeModal() {
    await (this.el.closest('ion-modal') as HTMLIonModalElement).dismiss();
  }

  private selectPhoto($event: CustomEvent): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (!$event || !$event.detail) {
        resolve();
        return;
      }

      const photo: HeritageItem = $event.detail;

      await this.imageHistoryService.push(photo);

      await (this.el.closest('ion-modal') as HTMLIonModalElement).dismiss(photo);

      resolve();
    });
  }

  private clear(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.searchTerm = undefined;

      this.photosOdd = null;
      this.photosEven = null;

      this.disableInfiniteScroll = false;

      this.paginationNext = 1;

      resolve();
    });
  }

  private handleInput($event: CustomEvent<KeyboardEvent>) {
    this.searchTerm = ($event.target as InputTargetEvent).value;
  }

  private search(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (!this.searchTerm || this.searchTerm.length <= 0) {
        await this.clear();
        resolve();
        return;
      }

      this.searching = true;

      const heritageResponse: HeritageItemSearchResponse | undefined = await this.heritageService.getHeritageItems(this.searchTerm, this.paginationNext);

      this.searching = false;

      if (!heritageResponse) {
        resolve();
        return;
      }

      const photos: HeritageItem[] = heritageResponse.results;

      if (!photos || photos.length <= 0) {
        this.emptyPhotos();

        resolve();
        return;
      }

      if (!this.photosOdd) {
        this.photosOdd = [];
      }

      if (!this.photosEven) {
        this.photosEven = [];
      }

      const newSearchTerm: boolean = !this.previousSearchTerm || this.searchTerm !== this.previousSearchTerm;

      if (newSearchTerm) {
        this.photosOdd = [];
        this.photosEven = [];
      }

      this.photosOdd = [...this.photosOdd, ...photos.filter((_a, i) => !(i % 2))];
      this.photosEven = [...this.photosEven, ...photos.filter((_a, i) => i % 2)];

      if (!this.paginationNext || this.paginationNext === 0 || newSearchTerm) {
        // We just put a small delay because of the repaint
        setTimeout(async () => {
          await this.autoScrollToTop();
        }, 100);
      }

      this.disableInfiniteScroll = false; //TODO: this.paginationNext * 10 >= heritageResponse.total;

      this.paginationNext++;

      this.previousSearchTerm = this.searchTerm;

      resolve();
    });
  }

  private autoScrollToTop(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const content: HTMLIonContentElement = this.el.querySelector('ion-content');

      if (!content) {
        resolve();
        return;
      }

      await content.scrollToTop();

      resolve();
    });
  }

  private emptyPhotos() {
    this.photosOdd = [];
    this.photosEven = [];

    this.disableInfiniteScroll = true;
  }

  private searchNext(e: CustomEvent<void>): Promise<void> {
    return new Promise<void>(async (resolve) => {
      await this.search();

      (e.target as HTMLIonInfiniteScrollElement).complete();

      resolve();
    });
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">{this.renderCloseButton()}</ion-buttons>
          <ion-title class="ion-text-uppercase">{i18n.state.editor.stock_photo}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <app-image-columns
          imagesOdd={this.photosOdd}
          imagesEven={this.photosEven}
          onSelectImage={($event: CustomEvent) => this.selectPhoto($event)}></app-image-columns>

        {this.renderPhotosPlaceHolder()}

        <ion-infinite-scroll threshold="100px" disabled={this.disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => this.searchNext(e)}>
          <ion-infinite-scroll-content loadingText={i18n.state.core.loading}></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </ion-content>,
      <ion-footer>
        <ion-toolbar>
          <ion-searchbar
            debounce={500}
            placeholder="Search"
            value={this.searchTerm}
            onIonClear={() => this.clear()}
            onIonInput={(e: CustomEvent<KeyboardEvent>) => this.handleInput(e)}
            onIonChange={() => {
              this.search();
            }}></ion-searchbar>
        </ion-toolbar>
      </ion-footer>,
    ];
  }

  private renderCloseButton() {
    if (!this.searchTerm || this.searchTerm.length <= 0 || this.searching) {
      return (
        <ion-button onClick={() => this.closeModal()} aria-label={i18n.state.core.close}>
          <ion-icon src="/assets/icons/ionicons/close.svg"></ion-icon>
        </ion-button>
      );
    } else {
      return (
        <ion-button onClick={() => this.clear()}>
          <ion-icon name="arrow-back"></ion-icon>
        </ion-button>
      );
    }
  }

  private renderPhotosPlaceHolder() {
    if ((!this.photosOdd || this.photosOdd.length <= 0) && (!this.photosEven || this.photosEven.length <= 0)) {
      return (
        <div class="photos-placeholder">
          <div>
            <ion-icon name="images"></ion-icon>
            <ion-label class="ion-text-center">{i18n.state.editor.photos_by_unsplash}</ion-label>
            {this.renderPlaceHolderSearching()}
          </div>
        </div>
      );
    } else {
      return undefined;
    }
  }

  private renderPlaceHolderSearching() {
    if (this.searching) {
      return (
        <p class="searching ion-margin-top">
          {i18n.state.editor.searching} <ion-spinner color="medium"></ion-spinner>
        </p>
      );
    } else {
      return undefined;
    }
  }
}