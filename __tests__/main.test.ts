import {extractPublishedPackages} from "../src/extract-published-packages"

describe("extractPublishedPackages", () => {
  test("can parse single unscoped package", () => {
    const fixture = '🦋  bob-the-bundler@1.8.0-canary-17052a5.0'
    const result = extractPublishedPackages(fixture)
    expect(result).toStrictEqual({
      name: "bob-the-bundler",
      version: '1.8.0-canary-17052a5.0'
    })
  })

  test("can parse scoped monorepo package", () => {
    const fixture = '🦋  New tag:  @graphql-yoga/common@2.8.1-canary-66a4630.0'
    const result = extractPublishedPackages(fixture)
    expect(result).toStrictEqual({
      name: "@graphql-yoga/common",
      version: '2.8.1-canary-66a4630.0'
    })
  })

  test("can parse unscoped monorepo package", () => {
    const fixture = '🦋  New tag:  graphql-yoga@2.8.1-canary-66a4630.0'
    const result = extractPublishedPackages(fixture)
    expect(result).toStrictEqual({
      name: "graphql-yoga",
      version: '2.8.1-canary-66a4630.0'
    })
  })
})