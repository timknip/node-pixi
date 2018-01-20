import {createCanvas, createImageData} from 'canvas';

export function to_png (gl, width, height) {
    let pixels = new Uint8Array(width * height * 4),
        canvas = createCanvas(width, height),
        ctx = canvas.getContext('2d');

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let data = createImageData(new Uint8ClampedArray(pixels), width, height);

    ctx.putImageData(data, 0, 0);

    return canvas.toBuffer();
}
