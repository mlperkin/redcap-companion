export function processObservationData(
  item,
  excludedItems,
  observationPeriods,
  currentObservationId
) {
  // console.log("item obs here", item);
  let reasons = [];
  // DOCS: https://ohdsi.github.io/CommonDataModel/cdm54.html#OBSERVATION
  let person_id;
  if (!item.observation) item.observation = {};

  // Check for required fields and handle missing data

  // observation_id: Unique key for each Observation record
  if (!item.observation.observation_id) {
    item.observation.observation_id = currentObservationId;
  }

  // person_id: Identifies the person for whom the observation is recorded
  if (!item.person.person_id) {
    reasons.push("Missing person_id");
  } else {
    person_id = item.person.person_id;
  }

  // observation_date: Denotes the date of the observation
  if (!item.observation_period.start_date.redcap_value) {
    reasons.push("Missing observation_date");
  }

  for (let obs in item.observation) {
    // console.log("the rec1", item.observation[obs]);
    if (item.observation[obs].redcap_value) {
      // console.log("we have", item.observation);
      // console.log("we have redcap values here", item.observation[obs]);
    }

    // observation_concept_id: Represents the concept of the observation
    if (!item.observation[obs].mapping_metadata.extraData.concept_id) {
      reasons.push("Missing observation_concept_id");
    }
    // observation_type_concept_id: Indicates the provenance of the Observation record
    if (!item.observation[obs].observation_type_concept_id) {
      item.observation[obs].observation_type_concept_id = 32862; //temp static id for "Patient Filled Survey", would need to be modified to be more dynamic
      // reasons.push("Missing observation_type_concept_id");
    }

    // If any reasons were added to the list, mark this item as invalid
    if (reasons.length > 0) {
      // console.log("obs reasons", reasons);
      item.invalid_reasons = reasons.join(", ");
      excludedItems.push(item);
      return ""; // Return an empty string to signify no SQL statement was generated
    }

    // Construct the SQL INSERT statement
    let sql = `INSERT INTO observation (observation_id, person_id, observation_concept_id, observation_date, observation_type_concept_id) VALUES (${item.observation.observation_id}, ${person_id}, ${item.observation[obs].mapping_metadata.extraData.concept_id}, '${item.observation_period.start_date.redcap_value}', ${item.observation[obs].observation_type_concept_id});\n`;

    // Increment the observation_id for the next record
    currentObservationId++;

    return sql;
  }
}
