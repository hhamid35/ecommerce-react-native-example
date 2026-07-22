import colors from "../constants/Colors";

describe("Colors constants", () => {
  it("exposes the primary brand color", () => {
    expect(colors.primary).toBe("#FB6831");
  });

  it("defines the core color keys", () => {
    expect(Object.keys(colors)).toEqual(
      expect.arrayContaining(["primary", "secondary", "white", "dark"])
    );
  });
});
