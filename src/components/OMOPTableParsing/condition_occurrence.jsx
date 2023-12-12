export function processConditionOccurrenceData(
    item,
    excludedItems,
    visitOccurrences,
    visitDetails,
    incrementalID
  ) {
    let reasons = [];
  
    // Check for required fields
    if (!item.person_id) {
      reasons.push("Missing person_id");
    }
  
    if (!item.condition_concept_id) {
      reasons.push("Missing condition_concept_id");
    }
  
    if (!item.condition_start_date) {
      reasons.push("Missing condition_start_date");
    }
  
    // Use this field to understand the provenance of the Condition record.
    if (!item.condition_type_concept_id) {
      reasons.push("Missing condition_type_concept_id");
    }
  
    if (!item.condition_status_concept_id) {
      reasons.push("Missing condition_status_concept_id");
    }
  
    // If any reasons were added to the list, mark this item as invalid
    if (reasons.length > 0) {
      item.invalid_reasons = reasons.join(", ");
      excludedItems.push(item);
      return ""; // Return an empty string to signify no SQL statement was generated
    }
  
    // Determine visit_occurrence_id and visit_detail_id based on dates and visit data
    let visitOccurrenceId = null;
    let visitDetailId = null;
  
    // Logic to determine visit_occurrence_id and visit_detail_id based on dates and visit data
    // You may need to adapt this logic based on your specific data source.
  
    // Example logic:
    for (const visit of visitOccurrences) {
      if (
        visit.person_id === item.person_id &&
        visit.visit_start_date <= item.condition_start_date &&
        (!visit.visit_end_date || visit.visit_end_date >= item.condition_start_date)
      ) {
        visitOccurrenceId = visit.visit_occurrence_id;
        break;
      }
    }
  
    for (const visitDetail of visitDetails) {
      if (
        visitDetail.person_id === item.person_id &&
        visitDetail.visit_detail_start_date <= item.condition_start_date &&
        (!visitDetail.visit_detail_end_date ||
          visitDetail.visit_detail_end_date >= item.condition_start_date)
      ) {
        visitDetailId = visitDetail.visit_detail_id;
        break;
      }
    }
  
    // Construct the SQL INSERT statement
    let sql = `INSERT INTO condition_occurrence (condition_occurrence_id, person_id, condition_concept_id, condition_start_date, condition_type_concept_id, condition_status_concept_id, visit_occurrence_id, visit_detail_id) 
  VALUES (${incrementalID}, ${item.person_id}, ${item.condition_concept_id}, '${item.condition_start_date}', ${item.condition_type_concept_id}, ${item.condition_status_concept_id}, ${
      visitOccurrenceId ? visitOccurrenceId : "NULL"
    }, ${visitDetailId ? visitDetailId : "NULL"});\n`;
  
    // Increment the condition_occurrence_id for the next record
    incrementalID++;
  
    return sql;
  }
  