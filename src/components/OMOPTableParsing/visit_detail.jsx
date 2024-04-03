export function processVisitDetailData(
    item,
    excludedItems,
    observationPeriods,
    incrementalID
  ) {
    let reasons = [];
    console.log('item', item)
    // Check for required fields
    if (!item.person.person_id) {
      reasons.push("Missing person_id4");
    }
  
    if (!item.visit_occurrence.visit_concept_id) {
      reasons.push("Missing visit_detail_concept_id");
    }
  
    if (!item.visit_occurrence.start_date) {
      reasons.push("Missing visit_detail_start_date");
    }
  
    if (!item.visit_occurrence.end_date) {
      reasons.push("Missing visit_detail_end_date");
    }
  
    // Use this field to understand the provenance of the visit detail record.
    if (!item.visit_occurrence.visit_type_concept_id) {
      reasons.push("Missing visit_detail_type_concept_id");
    }
    console.log('visit detail reasons', reasons)
    // If any reasons were added to the list, mark this item as invalid
    if (reasons.length > 0) {
      item.invalid_reasons = reasons.join(", ");
      excludedItems.push(item);
      return ""; // Return an empty string to signify no SQL statement was generated
    }
  
    // Construct the SQL INSERT statement
    let sql = `INSERT INTO visit_detail (visit_detail_id, person_id, visit_detail_concept_id, visit_detail_start_date, visit_detail_end_date, visit_detail_type_concept_id) 
  VALUES (${incrementalID}, ${item.person.person_id}, ${item.visit_occurrence.visit_concept_id}, '${item.visit_occurrence.start_date}', '${item.visit_occurrence.end_date}', ${item.visit_occurrence.visit_type_concept_id});\n`;
  
    // Increment the visit_detail_id for the next record
    incrementalID++;
  
    return sql;
  }
  