import * as library from "../src/index";

describe("the library", () => {
  it("should export createSubject", () => {
    expect(library.createSubject).toBeDefined();
  });

  it("should export createObservable", () => {
    expect(library.createObservable).toBeDefined();
  });

  it("should export createObservableForValue", () => {
    expect(library.createObservableForValue).toBeDefined();
  });
});
