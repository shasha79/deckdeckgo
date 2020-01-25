import {DeckdeckgoAttributeDefinition} from '@deckdeckgo/types';

import {convertStyle} from '@deckdeckgo/deck-utils';

export class ParseAttributesUtils {
  static parseAttributes(attributes: DeckdeckgoAttributeDefinition[]): Promise<any> {
    return new Promise<any>(async (resolve) => {
      const attr: any = {};

      if (attributes && attributes.length > 0) {
        for (const def of attributes) {
          if (def.name === 'style') {
            attr['style'] = await convertStyle(def.value);
          } else {
            attr[def.name] = def.value;
          }
        }
      }

      resolve(attr);
    });
  }
}
