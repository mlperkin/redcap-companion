export function processObservationData(
  item,
  excludedItems,
  currentObservationId
) {
  console.log("processObservationData", item);
  let reasons = [];
  // DOCS: https://ohdsi.github.io/CommonDataModel/cdm54.html#OBSERVATION

  if (!item.observation) item.observation = {};

  // Check for required fields and handle missing data

  // observation_id: Unique key for each Observation record
  if (!item.observation.observation_id) {
    item.observation.observation_id = currentObservationId;
  }

  // person_id: Identifies the person for whom the observation is recorded
  if (!item.person.person_id) {
    reasons.push("Missing person_id");
  }

  // observation_concept_id: Represents the concept of the observation
  if (!item.observation.observation_concept_id) {
    reasons.push("Missing observation_concept_id");
  }

  // observation_date: Denotes the date of the observation
  if (!item.observation.observation_date) {
    reasons.push("Missing observation_date");
  }

  // observation_type_concept_id: Indicates the provenance of the Observation record
  if (!item.observation.observation_type_concept_id) {
    reasons.push("Missing observation_type_concept_id");
  }

  // If any reasons were added to the list, mark this item as invalid
  if (reasons.length > 0) {
    item.invalid_reasons = reasons.join(", ");
    excludedItems.push(item);
    return ""; // Return an empty string to signify no SQL statement was generated
  }

  // Construct the SQL INSERT statement
  let sql = `INSERT INTO observation (observation_id, person_id, observation_concept_id, observation_date, observation_type_concept_id) 
VALUES (${item.observation.observation_id}, ${item.person.person_id}, ${item.observation.observation_concept_id}, '${item.observation.observation_date}', ${item.observation.observation_type_concept_id});\n`;

  // Increment the observation_id for the next record
  currentObservationId++;

  return sql;
}
