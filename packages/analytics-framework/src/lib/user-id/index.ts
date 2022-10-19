import { generateUserId } from '~/lib/generate'

/* eslint-disable camelcase */
// Pre-generate crc32 polynomial lookup table
// http://wiki.osdev.org/CRC32#Building_the_Lookup_Table
// ... Actually use Alex's because it generates the correct bit order
//     so no need for the reversal function
const crc32_lookup_table = new Uint32Array(256)
for (let i = 256; i--; ) {
  let tmp = i
  for (let k = 8; k--; ) {
    tmp = tmp & 1 ? 3988292384 ^ (tmp >>> 1) : tmp >>> 1
  }
  crc32_lookup_table[i] = tmp
}

export function crc32(data: string): number {
  let crc = -1 // Begin with all bits set ( 0xffffffff )
  for (let i = 0, l = data.length; i < l; i++) {
    crc = (crc >>> 8) ^ crc32_lookup_table[(crc & 255) ^ data.charCodeAt(i)]
  }
  return (crc ^ -1) >>> 0 // Apply binary NOT
}

export function checkFraction(id: string | null, activatedFraction: number): boolean {
  if (!id) {
    return false
  }
  const discretizator = 524309
  const groupId = (crc32(id) >>> 3) % discretizator
  const groupIdThreshold = activatedFraction * discretizator
  return groupId < groupIdThreshold
}

// fast dirty implementation, only for unit tests
export function makeGoodUserId(fraction: number) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const userId = generateUserId()
    const good = checkFraction(userId, fraction)
    if (good) {
      return userId
    }
  }
}

// fast dirty implementation, only for unit tests
export function makeBadUserId(fraction: number) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const userId = generateUserId()
    const good = checkFraction(userId, fraction)
    if (!good) {
      return userId
    }
  }
}
