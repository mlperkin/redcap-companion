const axios = require("axios");
// require("dotenv").config();

async function testRedcapConnection(dataObj) {
  // if (process.env.NODE_ENV === "local") {
  // //need to remove this for prod
  // // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Add this at the top of your file
  // }
  // console.log('dataobj', dataObj)
  try {
    const FormData = require("form-data");
    let data = new FormData();

    data.append("token", dataObj.redcapAPIKey);
    data.append("content", "version");
    data.append("format", "json");
    data.append("returnFormat", "json");

    // Check if the last character of dataObj.redcapAPIURL is '/'
    if (dataObj.redcapAPIURL.charAt(dataObj.redcapAPIURL.length - 1) !== "/") {
      // If not, add the '/' to the end of the string
      dataObj.redcapAPIURL += "/";
    }

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: dataObj.redcapAPIURL,
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios.request(config);

    // Check if the response is successful (status 200) and return true
    if (response.status === 200) {
      console.log("Redcap Response:", response.data);
      return true;
    } else {
      console.log("Unexpected Redcap response:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error connecting to REDCap API:", error.message);
    return false;
  }
}

async function getRedcapRecords(dataObj) {
  // if (process.env.NODE_ENV === "local") {
  // //need to remove this for prod
  // // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Add this at the top of your file
  // }

  try {
    const FormData = require("form-data");
    let data = new FormData();
    data.append("token", dataObj.redcapAPIKey);
    data.append("content", "record");
    data.append("format", "json");
    data.append("returnFormat", "json");
    data.append("action", "export");
    data.append("type", "flat");
    data.append("rawOrLabel", "raw");
    data.append("rawOrLabelHeaders", "raw");
    data.append("forms[0]", dataObj.formName);

    // Check if the last character of dataObj.redcapAPIURL is '/'
    if (dataObj.redcapAPIURL.charAt(dataObj.redcapAPIURL.length - 1) !== "/") {
      // If not, add the '/' to the end of the string
      dataObj.redcapAPIURL += "/";
    }

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: dataObj.redcapAPIURL,
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios.request(config);

    // Check if the response is successful (status 200) and return true
    if (response.status === 200) {
      // console.log("Redcap Response:", response.data);
      return response.data;
    } else {
      console.log("Unexpected Redcap response:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error connecting to REDCap API:", error.message);
    return false;
  }
}

module.exports = {
  testRedcapConnection,
  getRedcapRecords,
};
