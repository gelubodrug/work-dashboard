// This function generates a consistent color based on a string (name)
export function getAvatarColors(name: string): { background: string; text: string } {
  // Generate a simple hash from the name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  // List of background colors (tailwind-like colors)
  const bgColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-red-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-indigo-100",
    "bg-teal-100",
    "bg-orange-100",
    "bg-cyan-100",
    "bg-lime-100",
    "bg-emerald-100",
    "bg-violet-100",
    "bg-fuchsia-100",
    "bg-rose-100",
    "bg-amber-100",
  ]

  // List of text colors that pair well with the backgrounds
  const textColors = [
    "text-blue-700",
    "text-green-700",
    "text-yellow-700",
    "text-red-700",
    "text-purple-700",
    "text-pink-700",
    "text-indigo-700",
    "text-teal-700",
    "text-orange-700",
    "text-cyan-700",
    "text-lime-700",
    "text-emerald-700",
    "text-violet-700",
    "text-fuchsia-700",
    "text-rose-700",
    "text-amber-700",
  ]

  // Use the hash to pick a consistent color
  const colorIndex = Math.abs(hash) % bgColors.length

  return {
    background: bgColors[colorIndex],
    text: textColors[colorIndex],
  }
}
