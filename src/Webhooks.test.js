import Webhooks from "./Webhooks";

import EventEmitter from "eventemitter3";
const nock = require("nock");


test("[SMOKE] it creates an object", () => {
    const config = {
        get: jest.fn()
    }
    config.get.mockReturnValueOnce({});
    const stubLiveThread = {
        on: jest.fn(),
    };

    const hooks = new Webhooks(config, stubLiveThread);

    expect(hooks).toBeInstanceOf(Webhooks);
});

test("it loads config properly", () => {
    const config = {
        get: jest.fn()
    }
    config.get.mockReturnValueOnce({});
    const stubLiveThread = {
        on: jest.fn(),
    };

    const hooks = new Webhooks(config, stubLiveThread);

    expect(config.get).toHaveBeenCalledWith("webhooks");
});

test("it subscribes to events properly", () => {
    const config = {
        get: jest.fn()
    }
    config.get.mockReturnValueOnce({ connected: ["TEST"] });
    const stubLiveThread = {
        on: jest.fn(),
    };

    const hooks = new Webhooks(config, stubLiveThread);

    expect(stubLiveThread.on).toHaveBeenCalledWith("connected", expect.any(Function))
});

test("it responds to events", () => {
    const config = {
        get: jest.fn()
    }
    config.get.mockReturnValueOnce({ connected: ["http://test.com/webhook"] })
        .mockReturnValueOnce(["http://test.com/webhook"]);

    const stubLiveThread = new EventEmitter();
    jest.spyOn(stubLiveThread, "on");

    const hookMock = nock("http://test.com")
        .post("/webhook")
        .reply(200);

    const hooks = new Webhooks(config, stubLiveThread);

    expect(stubLiveThread.on).toHaveBeenCalled();

    stubLiveThread.emit("connected", {});

    setTimeout(() => {
        hookMock.done();
    }, 500);
});

test("it handles errors properly", () => {
    const config = {
        get: jest.fn()
    }
    config.get.mockReturnValueOnce({ connected: ["http://test.com/webhook"] })
        .mockReturnValueOnce(["http://test.com/webhook"]);

    const stubLiveThread = new EventEmitter();
    jest.spyOn(stubLiveThread, "on");

    const hookMock = nock("http://test.com")
        .post("/webhook")
        .reply(500);
    
    jest.spyOn(global.console, "error");

    const hooks = new Webhooks(config, stubLiveThread);

    expect(stubLiveThread.on).toHaveBeenCalled();

    stubLiveThread.emit("connected", {});

    setTimeout(() => {
        hookMock.done();
        expect(global.console.error).toHaveBeenCalled();
    }, 500);
});

test("it handles FUBAR config", () => {
    const config = {
        get: jest.fn()
    }
    config.get.mockReturnValueOnce({ __: ["http://test.com/webhook"] })
        .mockReturnValueOnce(undefined);

    const stubLiveThread = new EventEmitter();
    jest.spyOn(stubLiveThread, "on");
    
    jest.spyOn(global.console, "error");

    const hooks = new Webhooks(config, stubLiveThread);

    expect(stubLiveThread.on).toHaveBeenCalled();

    stubLiveThread.emit("connected", {});

    setTimeout(() => {
        expect(global.console.error).toHaveBeenCalled();
    }, 500);
});
