export const OR = (...args: [boolean, ...boolean[]]) => args.includes(true)
export const AND = (...args: [boolean, ...boolean[]]) => !args.includes(false)
