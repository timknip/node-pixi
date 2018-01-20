## node-pixi

Run [PIXI.js](https://github.com/pixijs/pixi.js/) on node.

Headless WebGL rendering is enabled through the [GL](https://www.npmjs.com/package/gl) package.

To force canvas rendering:

```javascript
const app = new PIXI.Application({forceCanvas: true});
```

### image output

Call ```app.view.toBuffer()``` to get a node ```Buffer```.

Supported formats:

-  jpg
-  png
-  pdf
-  svg

```javascript
// toBuffer returns a Promise

// JPEG: (second argument specifies quality, value in range 0 to 1)
app.view.toBuffer('jpg', 1).then(buffer => {
    fs.writeFileSync('che.jpg', buffer);
}).catch(err => {
    console.error(err);
});

// PNG:
app.view.toBuffer('png').then(buffer => {
    fs.writeFileSync('che.png', buffer);
}).catch(err => {
    console.error(err);
});

// or simply use without arguments
app.view.toBuffer().then(buffer => {
    fs.writeFileSync('che.png', buffer);
}).catch(err => {
    console.error(err);
});

// PDF:
app.view.toBuffer('pdf').then(buffer => {
    fs.writeFileSync('che.pdf', buffer);
}).catch(err => {
    console.error(err);
});

// SVG:
app.view.toBuffer('svg').then(buffer => {
    fs.writeFileSync('che.svg', buffer);
}).catch(err => {
    console.error(err);
});
```

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

    // toBuffer returns a Promise
    app.view.toBuffer('jpg', 1).then(buffer => {
        fs.writeFileSync('che.jpg', buffer);
    }).catch(err => {
        console.error(err);
    });
});

PIXI.loader.onError.add((err) => {
    console.error(err);
});

PIXI.loader.load();

```
