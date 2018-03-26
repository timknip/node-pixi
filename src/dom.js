import fs from 'fs';
import gl from 'gl';
import * as canvas from 'canvas';
import XMLHttpRequest from 'xhr2';
import EventEmitter from 'events';
import request from 'request';
import * as webgl from './webgl';

let NODE_PIXI_WEBGL = false;

class Element {

    constructor () {
        this.style = {};
        this.offsetWidth = 20;
        this.offsetHeight = 20;
        this._clientWidth = 20;
        this._clientHeight = 20;
    }

    addEventListener () {}

    appendChild () {}

    removeChild () {}

    get clientHeight () {
        return this._clientHeight;
    }

    set clientHeight (value) {
        this._clientHeight = value;
    }

    get clientWidth () {
        return this._clientWidth;
    }

    set clientWidth (value) {
        this._clientWidth = value;
    }
}

class AnchorElement extends Element {

    constructor () {
        super();

        this._href = '';
    }

    get href () {
        return this._href;
    }
    set href (value) {
        this._href = value;
    }
}

export class Canvas extends Element {

    static imageToImageData (image, flip_y = true) {
        if (NODE_PIXI_WEBGL) {
            let c = canvas.createCanvas(image.width, image.height),
                ctx = c.getContext('2d');
            if (flip_y) {
                ctx.scale(1, -1);
                ctx.translate(0, -image.height);
            }
            ctx.drawImage(image, 0, 0);
            return ctx.getImageData(0, 0, image.width, image.height);
        } else {
            return image;
        }
    }

    constructor () {
        super();

        this._canvas = canvas.createCanvas(1, 1);

        //patching this stuff is necessary, see jsdom HTMLCanvasElement-impl
        this._ctx = this._canvas.getContext('2d');
        this._ctx.canvas = this._canvas;

        let patch = (ctx, name) => {
            const prev = ctx[name];
            ctx[name] = function (image) {
                arguments[0] = image instanceof Image ? image : image._canvas;
                return prev.apply(ctx, arguments);
            };
        };

        patch(this._ctx, 'createPattern');
        patch(this._ctx, 'drawImage');
        
        this._webgl = false;
        this._webglResizeExt = null;
    }

    getContext (value, contextOptions) {
        if (value === 'webgl') {
            this._ctx = gl(1, 1, contextOptions);
            global.window.WebGLRenderingContext = this._ctx;
            this._webgl = true;
            this._webglResizeExt =
                this._ctx.getExtension('STACKGL_resize_drawingbuffer');
            NODE_PIXI_WEBGL = true;
        }
        return this._ctx;
    }

    get height () {
        return this._canvas.height;
    }
    set height (value) {
        if (this._webglResizeExt) {
            this._webglResizeExt.resize(this.width, value);
        }
        this._canvas.height = value;
    }

    get width () {
        return this._canvas.width;
    }
    set width (value) {
        if (this._webglResizeExt) {
            this._webglResizeExt.resize(value, this.height);
        }
        this._canvas.width = value;
    }

    toBuffer (format = 'png', quality = 1) {
        let c = this._webgl ?
            webgl.to_canvas(this._ctx, this.width, this.height) :
            this._canvas;

        return new Promise((resolve, reject) => {
            if (format === 'jpg') {
                c.toDataURL('image/jpeg', quality, (err, data) => {
                    if (err) return reject(err);
                    data = data.replace(/^[^,]+,/, '');
                    resolve(new Buffer(data, 'base64'));
                });
            } else if (format === 'png') {
                resolve(c.toBuffer());
            } else if (format === 'pdf' || format === 'svg') {
                let cnv = canvas.createCanvas(this.width, this.height, format),
                    ctx = cnv.getContext('2d'),
                    img = new canvas.Image;

                img.onload = () => {
                    ctx.drawImage(img, 0, 0, this.width, this.height);
                    resolve(cnv.toBuffer());
                };
                img.onerror = (err) => {
                    reject(err);
                };
                img.src = c.toBuffer();
            } else {
                reject(new Error(`invalid format: ${format}`));
            }
        });
    }
}

// monkey patch Canvas#Image
canvas.Image.prototype._eventemitter = null;
canvas.Image.prototype.addEventListener = function (name, cb) {
    if (!this._eventemitter) {
        this._eventemitter = new EventEmitter;
    }
    this._eventemitter.once(name, cb);
}
canvas.Image.prototype._src = '';
Object.defineProperty(canvas.Image.prototype, "src", {
    get: function src() {
        return this._src;
    },
    set: function src(value) {
        let isBuffer = value instanceof Buffer;

        if (typeof value === 'string' && value.match(/^https?/)) {
            request({
                method: 'GET',
                url: value,
                encoding: null
            }, (err, res, body) => {
                if (err) {
                    this._eventemitter.emit('error', {
                        target: {
                            nodeName: err
                        }
                    });
                } else {
                    this._src = value;
                    this.source = body;
                    this._eventemitter.emit('load');
                }
            });
        } else if (isBuffer || typeof value === 'string') {
            process.nextTick(() => {
                this._src = this.source = value;
                this._eventemitter.emit('load');
            });
        } else {
            process.nextTick(() => {
                this._eventemitter.emit('error', {
                    target: {
                        nodeName: new Error('unable to set Image#src')
                    }
                });
            });
        }
    }
});

class Document {

    constructor () {
        this.body = new Element;
        this.documentElement = this.body;
    }

    addEventListener () {}
    appendChild (child) {}
    removeChild (child) {}

    createElement (tag) {
        switch (tag) {
            case 'canvas':
                return new Canvas();
            case 'div':
                return new Element();
            case 'a':
                return new AnchorElement();
            default:
                throw new Error(`Document::createElement: unhandled "${tag}"`);
        }
    }
}

class Window {

    constructor (document) {
        this.document = document;
        this.navigator = {
            userAgent: 'node-pixi',
            appVersion: '0.3.3'
        };
        this.location = "http://localhost/";
        this.Image = canvas.Image;
        this.WebGLRenderingContext = {};
    }

    addEventListener () {}
}

global.document = new Document;
global.window = new Window(global.document);
global.navigator = global.window.navigator;
global.Image = canvas.Image;
global.XMLHttpRequest = XMLHttpRequest;
global.Canvas = Canvas;
