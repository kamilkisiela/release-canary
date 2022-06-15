export function extractPublishedPackages(line: string): { name: string, version: string } | null {
  let newTagRegex = /New tag:\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/
  let match = line.match(newTagRegex)
  
  if (match === null) {
      let npmOutRegex = /\+?\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/
      match = line.match(npmOutRegex)
  }

  
  if (match) {
    const [, name, version] = match
    return { name, version }
  }

  return null
}