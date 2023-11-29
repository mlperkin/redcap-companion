export function processVisitOccurrenceData(
  item,
  excludedItems,
  observationPeriods,
  incrementalID
) {
  // console.log("processVisitOccurrenceData", item);
  let reasons = [];
  //DOCS https://ohdsi.github.io/CommonDataModel/cdm54.html#VISIT_OCCURRENCE

  // Assuming item has properties that map to visit_occurrence columns like visit_concept_id, visit_start_date, etc.
  if (!item.visit_occurrence) item.visit_occurrence = {};
  if (!item.person.person_id) {
    reasons.push("Missing person_id");
  }

  // visit_occurrence_id	Use this to identify unique interactions between a person and the health care system. This identifier links across the other CDM event tables to associate events with a visit.

  // This field contains a concept id representing the kind of visit, like inpatient or outpatient. All concepts in this field should be standard and belong to the Visit domain.
  if (!item.visit_occurrence.visit_concept_id) {
    item.visit_occurrence.visit_concept_id = 32862; // 32862 is Patient filled survey
    // reasons.push("Missing visit_concept_id");
  }
  //grab start and end dates from obsPeriod data
  observationPeriods.forEach((obsPeriod) => {
    if (obsPeriod.person_id.toString() === item.person.person_id.toString()) {
      item.visit_occurrence.start_date = obsPeriod.start_date;
      item.visit_occurrence.end_date = obsPeriod.end_date;
    }
  });

  // For inpatient visits, the start date is typically the admission date. For outpatient visits the start date and end date will be the same.
  if (!item.visit_occurrence.start_date) {
    reasons.push("Missing visit_start_date");
  }

  // For inpatient visits the end date is typically the discharge date. If a Person is still an inpatient in the hospital at the time of the data extract and does not have a visit_end_date, then set the visit_end_date to the date of the data pull.
  if (!item.visit_occurrence.end_date) {
    reasons.push("Missing visit_end_date");
  }

  // Use this field to understand the provenance of the visit record, or where the record comes from.
  if (!item.visit_occurrence.visit_type_concept_id) {
    item.visit_occurrence.visit_type_concept_id = 32862; // 32862 is Patient filled survey
    // reasons.push("Missing visit_type_concept_id");
  }
  // If any reasons were added to the list, mark this item as invalid
  if (reasons.length > 0) {
    item.invalid_reasons = reasons.join(", ");
    excludedItems.push(item);
    return ""; // Return an empty string to signify no SQL statement was generated
  }

  // Construct the SQL INSERT statement
  let sql = `INSERT INTO visit_occurrence (visit_occurrence_id, person_id, visit_concept_id, visit_start_date, visit_end_date, visit_type_concept_id) 
VALUES (${incrementalID}, ${item.person.person_id}, ${item.visit_occurrence.visit_concept_id}, '${item.visit_occurrence.start_date}', '${item.visit_occurrence.end_date}', ${item.visit_occurrence.visit_type_concept_id});\n`;

  // Increment the visit_occurrence_id for the next record
  incrementalID++;

  return sql;
}
