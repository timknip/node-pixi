import fs from 'fs';
import path from 'path';
import * as dom from './dom';
import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
    backgroundColor: 0x000000
});

function load_image (tag, filename) {
    return new Promise((resolve, reject) => {
        PIXI.loader.add(tag, filename).load((loader, resources) => {
            resolve(resources);
        });
    });
}

export function test () {

    return load_image('che', 'https://www.famousbirthdays.com/headshots/che-guevara-1.jpg')
    .then(resources => {

        const bunny = new PIXI.Sprite(resources.che.texture);

        // Setup the position of the bunny
        bunny.x = app.renderer.width / 2;
        bunny.y = app.renderer.height / 2;

        // Rotate around the center
        bunny.anchor.x = 0.5;
        bunny.anchor.y = 0.5;

        // Add the bunny to the scene we are building
        app.stage.addChild(bunny);

        app.render();

        fs.writeFileSync('bunny.png', app.view._canvas.toBuffer())
    });
    //return load_image('che.jpg');
}
