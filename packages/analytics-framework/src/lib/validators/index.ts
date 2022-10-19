export const isIntStr = (value: string) => {
  const parsed = parseInt(value)

  return isFinite(parsed) && parsed === Number(value)
}
