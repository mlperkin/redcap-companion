export function processVisitOccurrenceData(item, excludedItems) {
    console.log("processVisitOccurrenceData");
    let reasons = [];
  
    // Assuming item has properties that map to visit_occurrence columns like visit_concept_id, visit_start_date, etc.
    if (!item.visit_occurrence_id) {
      reasons.push("Missing visit_occurrence_id");
    }
  
    if (!item.person_id) {
      reasons.push("Missing person_id");
    }
  
    if (!item.visit_concept_id) {
      reasons.push("Missing visit_concept_id");
    }
  
    if (!item.visit_start_date) {
      reasons.push("Missing visit_start_date");
    }
  
    if (!item.visit_end_date) {
      reasons.push("Missing visit_end_date");
    }
  
    if (!item.visit_type_concept_id) {
      reasons.push("Missing visit_type_concept_id");
    }
  
    // If any reasons were added to the list, mark this item as invalid
    if (reasons.length > 0) {
      item.invalid_reasons = reasons.join(", ");
      excludedItems.push(item);
      return ""; // Return an empty string to signify no SQL statement was generated
    }
  
    // Construct the INSERT statement using the valid item data
    return `INSERT INTO visit_occurrence (visit_occurrence_id, person_id, visit_concept_id, visit_start_date, visit_end_date, visit_type_concept_id) VALUES (${item.visit_occurrence_id}, ${item.person_id}, ${item.visit_concept_id}, '${item.visit_start_date}', '${item.visit_end_date}', ${item.visit_type_concept_id});\n`;
  }
  