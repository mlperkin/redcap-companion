export function processObservationData(item) {
    // let content = "";
    // const personID = item[checkboxFieldData.person.idTextValue];
    // const birthDateConceptId =
    //   item.checkboxFieldData?.person?.birthdateTextValue?.mapping_metadata
    //     ?.extraData?.concept_id;
    // const ageValue = item.imp_age?.redcap_value;
    // const ageConceptId =
    //   item.imp_age?.mapping_metadata?.imp_age?.extraData?.concept_id;
    // const observationEntries = [
    //   {
    //     conceptId: birthDateConceptId,
    //     value: item[checkboxFieldData.person.birthdateTextValue]?.redcap_value,
    //   },
    //   { conceptId: ageConceptId, value: ageValue },
    // ];
    // observationEntries.forEach(({ conceptId, value }) => {
    //   content += `-- Inserting observation for personID = ${personID}\n`;
    //   content += `INSERT INTO observation (observation_period_id, person_id, observation_period_start_date, observation_period_end_date, period_type_concept_id) `;
    //   content += `VALUES ((SELECT COALESCE(MAX(observation_id), 0) + 1 FROM observation), '${personID}', ${conceptId}, '${value}', CURRENT_DATE, 123456);\n\n`;
    // });
    // return content;
  }