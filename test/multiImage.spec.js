import fs from 'fs';
import { PIXI, Canvas } from '../src/index';

describe('multiImage', function() {
    this.timeout(5000);

    it('should render multiple images', cb => {
        const app = new PIXI.Application({
          backgroundColor: 0xff0000,
          forceCanvas: false,
        });

        PIXI.loader
          .add(
            'img_0',
            'https://www.famousbirthdays.com/headshots/che-guevara-1.jpg',
          )
          .add(
            'img_1',
            'https://www.famousbirthdays.com/faces/obama-barack-image.jpg',
          );

        PIXI.loader.onComplete.add(() => {
          let img_0 = new PIXI.Sprite(PIXI.loader.resources.img_0.texture);
          let img_1 = new PIXI.Sprite(PIXI.loader.resources.img_1.texture);

          // Setup the position of img_0
          img_0.x = 0;
          img_0.y = 0;

          img_1.x = 300;
          img_1.y = 0;

          app.stage.addChild(img_0);
          app.stage.addChild(img_1);

          app.render();

          // toBuffer returns a Promise
          app.view
            .toBuffer('jpg', 1)
            .then(buffer => {
              fs.writeFileSync(
                'people.jpg',
                buffer,
              );
              process.exit(0);
            })
            .catch(err => {
              console.error(err);
              process.exit(0);
            });
        });

        PIXI.loader.load();

    });
});
