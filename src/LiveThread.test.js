import LiveThread from "./LiveThread";

const nock = require("nock");
import WS, { __reset, __fire } from "ws";
import { AssertionError } from "assert";
jest.mock("ws");

beforeEach(() => {
  __reset();
});

it("loads a live thread", async () => {
  const testSlug = "TEST";
  const testSnoowrap = {};

  const mock = nock("https://reddit.com")
    .get(`/live/${testSlug}/about.json`)
    .reply(200, { data: { state: "complete" } });

  const result = new LiveThread(testSnoowrap, testSlug);

  expect(result).toBeInstanceOf(LiveThread);

  await result.connect();
  mock.done();
});

it("handles errors loading", async () => {
  const testSlug = "TEST";
  const testSnoowrap = {};

  const mock = nock("https://reddit.com")
    .get(`/live/${testSlug}/about.json`)
    .reply(500);

  const lt = new LiveThread(testSnoowrap, testSlug);
  try {
    await lt.connect();
    throw new AssertionError();
  } catch (e) {}

  mock.done();
});

it("subscribes to a thread's websocket and fires a connected event", async done => {
  const testSlug = "TEST";
  const testWsUrl = "ws://localhost:8080";
  const testSnoowrap = {};

  const mock = nock("https://reddit.com")
    .get(`/live/${testSlug}/about.json`)
    .reply(
      200,
      JSON.stringify({ data: { state: "live", websocket_url: testWsUrl } })
    );

  const result = new LiveThread(testSnoowrap, testSlug);

  jest.spyOn(result.emitter, "emit");

  await result.connect();

  expect(result).toBeInstanceOf(LiveThread);
  mock.done();
  expect(WS).toHaveBeenLastCalledWith(testWsUrl);
  setTimeout(() => {
    expect(result.emitter.emit).toHaveBeenCalledWith("connected");
    done();
  }, 500);
});

it("handles events", async done => {
  const testSlug = "TEST";
  const testWsUrl = "ws://localhost:8080";
  const testSnoowrap = {};

  const mock = nock("https://reddit.com")
    .get(`/live/${testSlug}/about.json`)
    .reply(
      200,
      JSON.stringify({ data: { state: "live", websocket_url: testWsUrl } })
    );

  const result = new LiveThread(testSnoowrap, testSlug);

  jest.spyOn(result.emitter, "emit");

  expect(result).toBeInstanceOf(LiveThread);

  await result.connect();

  mock.done();
  expect(WS).toHaveBeenLastCalledWith(testWsUrl);
  const payload = { type: "delete", payload: {} };

  __fire("message", JSON.stringify(payload));
  setTimeout(() => {
    expect(result.emitter.emit).toHaveBeenCalledWith("data", payload);
    done();
  }, 500);
});

it("handles view count events", async done => {
  const testSlug = "TEST";
  const testWsUrl = "ws://localhost:8080";
  const testSnoowrap = {};

  const mock = nock("https://reddit.com")
    .get(`/live/${testSlug}/about.json`)
    .reply(
      200,
      JSON.stringify({ data: { state: "live", websocket_url: testWsUrl } })
    );

  const result = new LiveThread(testSnoowrap, testSlug);

  jest.spyOn(result.emitter, "emit");

  await result.connect();

  expect(result).toBeInstanceOf(LiveThread);
  mock.done();
  expect(WS).toHaveBeenLastCalledWith(testWsUrl);
  const payload = { type: "activity", payload: { count: 5, fuzzed: true } };
  __fire("message", JSON.stringify(payload));
  setTimeout(() => {
    expect(result.emitter.emit).toHaveBeenCalledWith(
      "settings.viewer_count",
      payload.payload.count
    );
    done();
  }, 500);
});
