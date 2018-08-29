import Webhooks from "./Webhooks";

import EventEmitter from "eventemitter3";
const nock = require("nock");
const convict = require("convict");

test("[SMOKE] it creates an object", () => {
  const config = {
    get: jest.fn()
  };
  config.get.mockReturnValueOnce({});
  const stubLiveThread = {
    on: jest.fn()
  };

  const hooks = new Webhooks(config, stubLiveThread);

  expect(hooks).toBeInstanceOf(Webhooks);
});

test("it loads config properly", () => {
  const config = {
    get: jest.fn()
  };
  config.get.mockReturnValueOnce({});
  const stubLiveThread = {
    on: jest.fn()
  };

  const hooks = new Webhooks(config, stubLiveThread);

  expect(config.get).toHaveBeenCalledWith("webhooks");
});

test("it subscribes to events properly", () => {
  const config = {
    get: jest.fn()
  };
  config.get.mockReturnValueOnce({ connected: ["TEST"] });
  const stubLiveThread = {
    on: jest.fn()
  };

  const hooks = new Webhooks(config, stubLiveThread);

  expect(stubLiveThread.on).toHaveBeenCalledWith(
    "connected",
    expect.any(Function)
  );
});

test("it responds to events", done => {
  const config = {
    get: jest.fn()
  };
  config.get
    .mockReturnValueOnce({ connected: ["http://test.com/webhook"] })
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
    done();
  }, 500);
});

test("it sends payloads", done => {
  const testUrl = "http://example.com/webhook";
  const config = convict({}).load({ webhooks: { connected: [testUrl] } })

  const stubLiveThread = new EventEmitter();
  jest.spyOn(stubLiveThread, "on");
  stubLiveThread.slug = "TEST";

  const testPayload = { test: "payload" };

  const hookMock = nock("http://example.com")
    .post("/webhook", {
      type: "connected",
      liveThreadId: "TEST",
      payload: testPayload
    })
    .reply(200);

  const hooks = new Webhooks(config, stubLiveThread);

  expect(stubLiveThread.on).toHaveBeenCalled();

  stubLiveThread.emit("connected", testPayload);

  setTimeout(() => {
    hookMock.done();
    done();
  }, 1000);
});

test("it handles errors properly", done => {
  const config = {
    get: jest.fn()
  };
  config.get
    .mockReturnValueOnce({ connected: ["http://test.com/webhook"] })
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
    done();
  }, 1000);
});

test("it handles FUBAR config", done => {
  const config = {
    get: jest.fn()
  };
  config.get
    .mockReturnValueOnce({ __: ["http://test.com/webhook"] })
    .mockReturnValueOnce(undefined);

  const stubLiveThread = new EventEmitter();
  jest.spyOn(stubLiveThread, "on");

  jest.spyOn(global.console, "error");

  const hookMock = nock("http://test.com")
    .post("/webhook")
    .reply(500);

  const hooks = new Webhooks(config, stubLiveThread);

  expect(stubLiveThread.on).toHaveBeenCalled();

  stubLiveThread.emit("connected", {});

  setTimeout(() => {
    // essentially, the webhook was *not* called
    expect(hookMock.isDone()).toBeFalsy();
    done();
  }, 500);
});
