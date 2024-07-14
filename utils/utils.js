function convertStringToArray(inputString) {
  // Remove new lines and trim any surrounding whitespace
  const cleanedString = inputString.replace(/\n/g, "").trim();

  // Remove the surrounding square brackets and split by comma
  const array = cleanedString.slice(1, -1).split('","');

  // Remove leading and trailing quotation marks from the first and last elements
  array[0] = array[0].replace(/^"/, "");
  array[array.length - 1] = array[array.length - 1].replace(/"$/, "");

  return array;
}
module.exports = { convertStringToArray };
