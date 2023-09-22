module.exports = function (dateString) {
  // Attempt to create a Date object from the given string
  const date = new Date(dateString)

  // Check if the date is invalid (NaN) or if the input string is not in a valid date format
  if (isNaN(date)) {
    return false
  }

  // Check if the year is within a reasonable range (adjust the range as needed)
  const year = date.getFullYear()
  if (year < 1000 || year > 9999) {
    return false
  }

  // If all checks pass, the string is a valid date
  return true
}
