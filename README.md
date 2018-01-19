## node-pixi

Run PIXI.js on node.

### example

```javascript
import fs from 'fs';
import {PIXI} from 'node-pixi';

const app = new PIXI.Application({backgroundColor: 0xff0000});

PIXI.loader.add('che', 'https://www.famousbirthdays.com/headshots/che-guevara-1.jpg');

PIXI.loader.onComplete.add(() => {

    const che = new PIXI.Sprite(PIXI.loader.resources.che.texture);

    // Setup the position of che
    che.x = app.renderer.width / 2;
    che.y = app.renderer.height / 2;

    // Rotate around the center
    che.anchor.x = 0.5;
    che.anchor.y = 0.5;

    // Add che to the scene we are building
    app.stage.addChild(che);

    app.render();

    fs.writeFileSync('che.jpg', app.view.toBuffer());
});

PIXI.loader.onError.add((err) => {
    console.error(err);
});

PIXI.loader.load();

```
