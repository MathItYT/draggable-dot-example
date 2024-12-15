import init, { hexToColor, WasmGradientImageOrColor, line, Scene, addFinalTip } from 'mathlikeanim-rs';

const width = 1920;
const height = 1080;
const fps = 60;
const container = document.getElementById('container');

const clientToCanvas = (clientX, clientY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * canvas.width / rect.width;
    const y = (clientY - rect.top) * canvas.height / rect.height;
    return [x, y];
};

async function run() {
    const scene = new Scene(width, height, fps);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    scene.setCanvasContext(ctx);
    const draggableDot = document.getElementById('draggable-dot');
    const top = (height / 2) * canvas.clientHeight / height;
    const left = (width / 2) * canvas.clientWidth / width;
    draggableDot.style.top = `${top}px`;
    draggableDot.style.left = `${left}px`;
    let arr = line(
        [0, 0],
        [width / 2, height / 2],
    ).setStroke(WasmGradientImageOrColor.fromColor(hexToColor('#EBEBEB', 1)), false).setStrokeWidth(5, false);
    arr = addFinalTip(arr, 40, hexToColor('#EBEBEB', 1));
    scene.add(arr.clone());
    await scene.renderFrame();
    const onDrag = async (e) => {
        arr = line(
            [0, 0],
            clientToCanvas(e.clientX, e.clientY, canvas),
        ).setStroke(WasmGradientImageOrColor.fromColor(hexToColor('#EBEBEB', 1)), false).setStrokeWidth(5, false);
        arr = addFinalTip(arr, 40, hexToColor('#EBEBEB', 1));
        scene.add(arr.clone());
        await scene.renderFrame();
        draggableDot.style.top = `${e.clientY}px`;
        draggableDot.style.left = `${e.clientX}px`;
    };
    draggableDot.addEventListener('mousedown', () => {
        document.addEventListener('mousemove', onDrag);
    });
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onDrag);
    });
}

init().then(run);