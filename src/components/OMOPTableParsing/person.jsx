export function processPersonData(item,excludedItems) {
    // console.log("processPersonData");
    let reasons = [];
    let gender_concept_id = item.person.male || item.person.female || null;
    let ethnicity_concept_id =
      item.person.hispanic_or_latino || item.person.not_hispanic || null;
    // console.log('person item', item)
    // Check for required items
    if (!item.person.birth_year) {
      reasons.push("Missing birth_year");
    }

    if (!item.person.person_id) {
      reasons.push("Missing person_id");
    }

    if (!gender_concept_id) {
      reasons.push("Missing gender_concept_id");
    }

    if (!ethnicity_concept_id) {
      reasons.push("Missing ethnicity_concept_id");
    }

    if (reasons.length > 0) {
      // console.log('id', item.person.person_id)
      // console.log('Person excluded', reasons)
      item.person.invalid_reasons = reasons.join(", ");
      excludedItems.push(item);
      return ""; // Return an empty string to signify no SQL statement was generated
    }

    // console.log('returning person sql!')

    return `INSERT INTO person (person_id, year_of_birth, gender_concept_id, ethnicity_concept_id) VALUES ('${item.person.person_id}', ${item.person.birth_year}, ${gender_concept_id}, ${ethnicity_concept_id});\n`;
  }