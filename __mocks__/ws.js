import EventEmitter from "eventemitter3";

let mockEE = new EventEmitter();

export function __reset() {
    mockEE = new EventEmitter();
    if (mock) {
        mock.mockClear();
    }
}

export function __fire() {
    mockEE.emit(arguments[0], Array.prototype.slice.call(arguments, 1));
}

const mock = jest.fn().mockImplementation(url => {
    setTimeout(() => { mockEE.emit("open"); }, 1);
    return mockEE;
});

export default mock;
