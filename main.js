import init, { hexToColor, WasmThreeDObject, rotMatrixEuler, applyMatrix, WasmGradientImageOrColor, line, Scene, addFinalTip, WasmCamera, WasmLightSource, threeDAxes } from 'mathlikeanim-rs';

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

const canvasToClient = (x, y, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = x * rect.width / canvas.width + rect.left;
    const clientY = y * rect.height / canvas.height + rect.top;
    return [clientX, clientY];
};

const inverseMatrix = (matrix) => {
    const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
    const det = a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h;
    return [
        [e * i - f * h, c * h - b * i, b * f - c * e],
        [f * g - d * i, a * i - c * g, c * d - a * f],
        [d * h - e * g, b * g - a * h, a * e - b * d],
    ].map((row) => row.map((val) => val / det));
};

async function run() {
    const scene = new Scene(width, height, fps);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    scene.setCanvasContext(ctx);
    const eulerAngles = [Math.PI / 180 * 10, -Math.PI / 2 + Math.PI / 180 * 30, Math.PI / 180 * 20];
    let arr = line(
        [0, 0],
        [width / 2, height / 2],
    ).setStroke(WasmGradientImageOrColor.fromColor(hexToColor('#EBEBEB', 1)), false).setStrokeWidth(5, false);
    arr = addFinalTip(arr, 40, hexToColor('#EBEBEB', 1));
    arr = arr.setSubobject(0, arr.getSubobject(0).setIndex(1));
    scene.add(arr.clone());
    let arr3D = WasmThreeDObject.fromVectorObject(arr.clone());
    let camera = new WasmCamera([960, 540, 0], eulerAngles, 1350, 1, width, height);
    let lightSource = new WasmLightSource([1920, 1080, 100]);
    let projected = arr3D.projectAndShade(camera, lightSource);
    scene.add(projected.clone());
    let ax3D = threeDAxes(
        0,
        1920,
        1920 / 10,
        0,
        1080,
        1080 / 10,
        0,
        1000,
        1000 / 10,
        [960, 540, 0],
        1100,
        900,
        1500,
        hexToColor('#EBEBEB', 1),
        5,
    );
    scene.add(ax3D.projectAndShade(camera, lightSource).setIndex(1));
    let arr3DWithoutSubobjects = projected.getSubobjects().filter((obj) => obj.getIndex() === 0)[0];
    let lastPoint = arr3DWithoutSubobjects.getPoints()[arr3DWithoutSubobjects.getPoints().length - 1];
    const [x, y] = lastPoint;
    const draggableDot = document.getElementById('draggable-dot');
    const [left, top] = canvasToClient(x, y, canvas);
    draggableDot.style.top = `${top}px`;
    draggableDot.style.left = `${left}px`;
    await scene.renderFrame();
    const onDrag = async (e) => {
        const [xCanvas, yCanvas] = clientToCanvas(e.clientX, e.clientY, canvas);
        arr = line(
            [0, 0],
            applyMatrix(inverseMatrix(rotMatrixEuler(...eulerAngles)), [[xCanvas - camera.getPosition()[0], yCanvas - camera.getPosition()[1], 0]])[0].map((val, i) => val + camera.getPosition()[i]),
        ).setStroke(WasmGradientImageOrColor.fromColor(hexToColor('#EBEBEB', 1)), false).setStrokeWidth(5, false);
        arr = addFinalTip(arr, 40, hexToColor('#EBEBEB', 1));
        arr = arr.setSubobject(0, arr.getSubobject(0).setIndex(1));
        let arr3D = WasmThreeDObject.fromVectorObject(arr);
        console.log(arr3D.getSubobjects().map((obj) => {
            console.log(obj);
            return obj.getIndex();
        }));
        projected = arr3D.projectAndShade(camera, lightSource);
        console.log(projected.getSubobjects().map((obj) => obj.getIndex()));
        scene.add(projected.clone());
        const l = projected.getSubobjects().filter((obj) => obj.getIndex() === 0)[0];
        const lastPoint = l.getPoints()[l.getPoints().length - 1];
        const [x, y] = lastPoint;
        const [left, top] = canvasToClient(x, y, canvas);
        draggableDot.style.top = `${top}px`;
        draggableDot.style.left = `${left}px`;
        await scene.renderFrame();
    };
    draggableDot.addEventListener('mousedown', () => {
        document.addEventListener('mousemove', onDrag);
    });
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onDrag);
    });
}

init().then(run);