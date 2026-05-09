import { TouchEvent } from "react";
import { sys } from "./sys";


interface Point {
    x: number, y: number
};
const touchData = { touching: false, trace: [] as Point[] };
const slideDistance = 150;

const callbacks = {
    onSlideUp: { callbacks: {} as any },
    onSlideDown: { callbacks: {} as any },
    onSlideLeft: { callbacks: {} as any },
    onSlideRight: { callbacks: {} as any }
};

function onTouchStart(evt: TouchEvent<HTMLDivElement>) {
    if (evt.touches.length !== 1) {
        touchData.touching = false;
        touchData.trace = [];
        return;
    }

    touchData.touching = true;
    touchData.trace = [
        {
            x: evt.touches[0].screenX,
            y: evt.touches[0].screenY
        }
    ];
}
function onTouchMove(evt: TouchEvent<HTMLDivElement>) {
    if (!touchData.touching) return;

    touchData.trace.push({
        x: evt.touches[0].screenX,
        y: evt.touches[0].screenY
    });
}
function onTouchEnd() {
    if (!touchData.touching) return;

    let trace = touchData.trace;
    touchData.touching = false;
    touchData.trace = [];
    handleTouch(trace);
}
function handleTouch(trace: Point[]) {
    let start = trace[0];
    let end = trace[trace.length - 1];

    if (end.y - start.y > slideDistance) {
        sys.log.info(">>>下滑操作...");
        Object.keys(callbacks.onSlideDown.callbacks).forEach(key =>
            callbacks.onSlideDown.callbacks[key]()
        );
    }
    else if (start.y - end.y > slideDistance) {
        sys.log.info(">>>上滑操作...");
        Object.keys(callbacks.onSlideUp.callbacks).forEach(key =>
            callbacks.onSlideUp.callbacks[key]()
        );
    }

    if (end.x - start.x > slideDistance) {
        sys.log.info(">>>右滑操作...");
        Object.keys(callbacks.onSlideRight.callbacks).forEach(key =>
            callbacks.onSlideRight.callbacks[key]()
        );
    }
    else if (start.x - end.x > slideDistance) {
        sys.log.info(">>>左滑操作...");
        Object.keys(callbacks.onSlideLeft.callbacks).forEach(key =>
            callbacks.onSlideLeft.callbacks[key]()
        );
    }
}
function addSlideUpFunc(f: Function) {
    const key = crypto.randomUUID();
    callbacks.onSlideUp.callbacks[key] = f;
    return key;
}
function removeSlideUpFunc(key: string) {
    delete callbacks.onSlideUp.callbacks[key];
}
function addSlideDownFunc(f: Function) {
    let key = crypto.randomUUID();
    callbacks.onSlideDown.callbacks[key] = f;
    return key;
}
function removeSlideDownFunc(key: string) {
    delete callbacks.onSlideDown.callbacks[key];
}
function addSlideLeftFunc(f: Function) {
    let key = crypto.randomUUID();
    callbacks.onSlideLeft.callbacks[key] = f;
    return key;
}
function removeSlideLeftFunc(key: string) {
    delete callbacks.onSlideLeft.callbacks[key];
}
function addSlideRightFunc(f: Function) {
    let key = crypto.randomUUID();
    callbacks.onSlideRight.callbacks[key] = f;
    return key;
}
function removeSlideRightFunc(key: string) {
    delete callbacks.onSlideRight.callbacks[key];
}

export default {
    onTouchEnd,
    onTouchMove,
    onTouchStart,

    addSlideUpFunc,
    removeSlideUpFunc,

    addSlideDownFunc,
    removeSlideDownFunc,

    addSlideLeftFunc,
    removeSlideLeftFunc,

    addSlideRightFunc,
    removeSlideRightFunc
}