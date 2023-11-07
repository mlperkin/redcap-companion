export function extractYearFromDate(dateValue, format) {
  if (!dateValue || dateValue === "") return;
  // Mapping of common date formats to regex patterns
  const formatPatterns = {
    "YYYY-MM-DD": /(\d{4})-\d{2}-\d{2}/,
    "MM-DD-YYYY": /\d{2}-\d{2}-(\d{4})/,
    "DD-MM-YYYY": /\d{2}-\d{2}-(\d{4})/,
    "MM/DD/YYYY": /\d{2}\/\d{2}\/(\d{4})/,
    "DD/MM/YYYY": /\d{2}\/\d{2}\/(\d{4})/,
    // Add more formats as needed
  };

  const regex = formatPatterns[format];
  if (!regex) {
    throw new Error("Unsupported date format");
  }

  const match = dateValue.match(regex);
  if (match && match[1]) {
    return match[1]; // Return the year
  } else {
    throw new Error("Invalid date value for the given format");
  }
}

export function downloadSQL(sqlContent, fileName) {
  // Create a Blob with the SQL content
  const blob = new Blob([sqlContent], {
    type: "text/plain;charset=utf-8;",
  });

  // Create a link and click it to trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCSV(content, filename) {
  console.log("download csv", content);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

export function sqlToCSV(sqlContent) {
  // Split the content into individual lines
  const lines = sqlContent.split("\n");

  // Initialize CSV output and a flag to check if headers have been captured
  let csvContent = "";
  let headersCaptured = false;

  lines.forEach((line) => {
    // Match the INSERT INTO line to extract column names, only if headers haven't been captured
    if (!headersCaptured) {
      const headerMatch = line.match(/INSERT INTO\s+\w+\s+\(([^)]+)\)/i);
      if (headerMatch) {
        // Split the column names into an array, trim each one
        const headers = headerMatch[1].split(",").map((h) => h.trim());
        csvContent += headers.join(",") + "\n";
        headersCaptured = true;
      }
    }

    // Match the VALUES line to extract values
    const valuesMatch = line.match(/VALUES\s+\(([^)]+)\)/i);
    if (valuesMatch) {
      // Handle the extraction of values, taking care of nested SELECT statements as before
      let values = [];
      let valueBuffer = "";
      let inSelect = 0;
      for (const char of valuesMatch[1]) {
        if (char === "(") inSelect++;
        if (char === ")") inSelect--;
        if (char === "," && inSelect === 0) {
          values.push(valueBuffer.trim());
          valueBuffer = "";
        } else {
          valueBuffer += char;
        }
      }
      if (valueBuffer) {
        values.push(valueBuffer.trim());
      }

      // Replace 'undefined' with empty strings and join the values
      const csvLine = values.map((v) => (v === "undefined" ? "" : v)).join(",");
      csvContent += csvLine + "\n";
    }
  });

  return csvContent;
}

export function downloadExcludedData(data) {
  let _dataString = JSON.stringify(data, null, 2);

  // Create a Blob with the SQL content
  const blob = new Blob([_dataString], {
    type: "text/plain;charset=utf-8;",
  });

  // Create a link and click it to trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "excludedData.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// export function extractValue(data) {
//   if (typeof data === "object" && data.hasOwnProperty("redcap_value")) {
//     return data.redcap_value;
//   }
//   return data;
// }

export // Additional utility function to convert a Date object to YYYY-MM-DD string
function formatDateToSQL(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
