export function processObservationPeriods(data, excludedItems) {
  // console.log("obs period data", data);

  let includedItems = data.reduce((acc, item) => {
    let reasons = [];
    const id = item.person.person_id;

    // Collect start and end dates, add reasons if they're missing
    let startDate = item.observation_period.start_date
      ? item.observation_period.start_date.redcap_value
      : null;
    if (!startDate) reasons.push("Missing start_date");

    let endDate = item.observation_period.end_date || null;
    if (!endDate) reasons.push("Missing end_date");

    // If both dates are missing, add to excludedItems
    if (!startDate && !endDate) {
      reasons.push("Both start_date and end_date are missing");
      excludedItems.push({
        person_id: id,
        invalid_reasons: reasons.join(", "),
      });
    } else {
      // If we have at least one date, consider this a valid item
      if (acc[id]) {
        // If this person_id already exists, we may need to compare and choose dates
        if (
          startDate &&
          (!acc[id].start_date || startDate < acc[id].start_date)
        ) {
          acc[id].start_date = startDate;
        }
        if (endDate && (!acc[id].end_date || endDate > acc[id].end_date)) {
          acc[id].end_date = endDate;
        }
      } else {
        // If this person_id doesn't exist, create the entry
        acc[id] = {
          person_id: id,
          start_date: startDate,
          end_date: endDate,
          period_type_concept_id: 32862, // Static ID for patient filled survey data
        };
      }
    }

    return acc;
  }, {});

  // Convert the included items object back to an array
  includedItems = Object.values(includedItems);
  // console.log("included", includedItems);
  // At this point, includedItems will contain only valid items
  // and excludedItems will contain all invalid items with their reasons
  return includedItems;
}

export function generateObservationPeriodSQL(observationPeriods) {
  let content = "";
  observationPeriods.forEach((period) => {
    content += `INSERT INTO observation_period (person_id, observation_period_start_date, observation_period_end_date, period_type_concept_id) VALUES ('${period.person_id}', '${period.start_date}', '${period.end_date}', '${period.period_type_concept_id}');\n`;
  });
  return content;
}
