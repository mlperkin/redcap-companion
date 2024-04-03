export function processDrugExposureData(
    item,
    excludedItems,
    visitOccurrences,
    incrementalID
  ) {
    let reasons = [];
    console.log('drug_exposure item', item);
  
    // Check for required fields
    if (!item.person.person_id) {
      reasons.push("Missing person_id3");
    }
  
    if (!item.observation.mapping_metadata.extraData.concept_id) {
      reasons.push("Missing drug_concept_id.");
    }
  
    if (!item.observation.mapping_metadata.extraData.valid_start_date) {
      reasons.push("Missing drug_exposure_start_date");
    }
  
    if (!item.observation.mapping_metadata.extraData.valid_end_date) {
      reasons.push("Missing drug_exposure_end_date");
    }
  
    if (!item.observation.mapping_metadata.extraData.concept_id) {
      reasons.push("Missing drug_type_concept_id");
    }
  
    console.log('drug_exposure reasons', reasons);
  
    // If any reasons were added to the list, mark this item as invalid
    if (reasons.length > 0) {
      item.invalid_reasons = reasons.join(", ");
      excludedItems.push(item);
      return ""; // Return an empty string to signify no SQL statement was generated
    }
  
    // Determine visit_occurrence_id based on dates and visit data
    let visitOccurrenceId = null;
  
    // Example logic to determine visit_occurrence_id
    for (const visit of visitOccurrences) {
      if (
        visit.person_id === item.person_id &&
        visit.visit_start_date <= item.drug_exposure_start_date &&
        (!visit.visit_end_date || visit.visit_end_date >= item.drug_exposure_start_date)
      ) {
        visitOccurrenceId = visit.visit_occurrence_id;
        break;
      }
    }
  
    // Construct the SQL INSERT statement
    let sql = `INSERT INTO drug_exposure (drug_exposure_id, person_id, drug_concept_id, drug_exposure_start_date, drug_exposure_end_date, drug_type_concept_id, visit_occurrence_id) 
  VALUES (${incrementalID}, ${item.person_id}, ${item.drug_concept_id}, '${item.drug_exposure_start_date}', '${item.drug_exposure_end_date}', ${item.drug_type_concept_id}, ${
      visitOccurrenceId ? visitOccurrenceId : "NULL"
    });\n`;
  
    // Increment the drug_exposure_id for the next record
    incrementalID++;
  
    return sql;
  }
  