const str = `${1e7}${-1e3}${-4e3}${-8e3}${-1e11}`

const replacer = () => (0 | (Math.random() * 16)).toString(16)

export const generateUserId = () => str.replace(/[10]/g, replacer)
