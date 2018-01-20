import * as dom from './dom';
import * as PIXI from 'pixi.js';

let Canvas = dom.Canvas;

/**
 * Patches PIXI loader's onComplete.
 * When using WebGLRenderer images need to be converted to ImageData as
 * glTexture doesn't like node-canvas Image.
 */
function monkey_patch_loader () {
    let fn = PIXI.loader.onComplete.add;
    PIXI.loader.onComplete.add = function (cb) {
        let f = function (m) {
            if (window.WebGLRenderingContext) {
                Object.keys(m.resources).forEach(key => {
                    let source = m.resources[key].texture.baseTexture.source;
                    if (source instanceof Image) {
                        m.resources[key].texture.baseTexture.source =
                            Canvas.imageToImageData(source);
                    }
                });
            }
            cb(m);
        }
        return fn.apply(this, [f])
    }
}

monkey_patch_loader();

export {
    PIXI,
    Canvas
};
