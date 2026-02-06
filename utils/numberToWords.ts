export function numberToWords(num: number): string {
  if (num === 0) return "Zero"

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"] // Extend as needed

  function convertChunk(n: number): string {
    let chunk = ""
    if (Math.floor(n / 100) > 0) {
      chunk += units[Math.floor(n / 100)] + " Hundred"
      n %= 100
      if (n > 0) chunk += " "
    }

    if (n >= 10 && n <= 19) {
      chunk += teens[n - 10]
    } else if (n >= 20) {
      chunk += tens[Math.floor(n / 10)]
      n %= 10
      if (n > 0) chunk += " "
      chunk += units[n]
    } else if (n > 0) {
      chunk += units[n]
    }
    return chunk.trim()
  }

  let words = ""
  const numStr = Math.abs(num).toFixed(2) // Handle decimals
  const [integerPart, decimalPart] = numStr.split(".")
  let intNum = Number.parseInt(integerPart)

  if (intNum === 0 && Number.parseInt(decimalPart) === 0) return "Zero"

  let i = 0
  while (intNum > 0) {
    const chunk = intNum % 1000
    if (chunk !== 0) {
      const chunkWords = convertChunk(chunk)
      words = chunkWords + (scales[i] ? " " + scales[i] : "") + (words ? " " + words : "")
    }
    intNum = Math.floor(intNum / 1000)
    i++
  }

  let decimalWords = ""
  if (Number.parseInt(decimalPart) > 0) {
    decimalWords = " and " + convertChunk(Number.parseInt(decimalPart)) + " Cents"
  }

  const finalWords = (num < 0 ? "Minus " : "") + words.trim() + decimalWords

  return finalWords.replace(/\s+/g, " ").trim() // Remove extra spaces
}
