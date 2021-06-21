import {EnvironmentConfigService} from '../core/environment/environment-config.service';

import store from '../../stores/error.store';

import {EnvironmentHeritageConfig} from '../../types/core/environment-config';

export class HeritageService {
  private static instance: HeritageService;

  static getInstance() {
    if (!HeritageService.instance) {
      HeritageService.instance = new HeritageService();
    }
    return HeritageService.instance;
  }


  getHeritageItems(searchTerm: string, next: string | number): Promise<HeritageItemSearchResponse | undefined> {
    return new Promise<HeritageItemSearchResponse | undefined>(async (resolve) => {
      const config: EnvironmentHeritageConfig = EnvironmentConfigService.getInstance().get('heritage');

      var offset = 20*(+next-1);

      const searchUrl: string =
        config.url +
        'items?query=' +
        searchTerm +
        '&offset=' +
        offset;

      try {
        const rawResponse: Response = await fetch(searchUrl);

        const response: HeritageItemSearchResponse = JSON.parse(await rawResponse.text());

        if (!response) {
          store.state.error = 'Heritage items could not be fetched';
          resolve(undefined);
          return;
        }

        resolve(response);
      } catch (err) {
        store.state.error = err.message;
        resolve(undefined);
      }
    });
  }

}
