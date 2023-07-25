# REDCap Companion Desktop App
This app imports the CSV mapping file that is generated from final step in the CDE to OMOP web app. You need to enter your REDCap API credentials in order to get the records as well as your database credentials to insert the records into the appropriate OMOP tables.

# How to run or build .exe 
Clone the repo down and run `npm install` 

## To run without building
Execute the command `npm run start` and will attempt to run on http://localhost:3000/

## To Build .exe file
Run `npm run build`

This will create a `build` and `dist` directory. The .exe will be located in the `dist`` directory.