const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
///
app.get("/states/", async (request, response) => {
  const sqlQuery = `SELECT * FROM state ;`;
  const allStates = await db.all(sqlQuery);
  response.send(allStates);
});
///
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getBookQuery = `SELECT * FROM state WHERE state_id=${stateId};`;
  const getBook = await db.get(getBookQuery);
  response.send(getBook);
});
///
app.post("/districts/", async (request, response) => {
  const getDistrictDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = getDistrictDetails;

  const sqlQuery1 = `INSERT INTO 
  district(district_name,state_id, cases,cured,active,deaths)

VALUES
(
'${districtName}',
${stateId},
${cases},
${cured},
${active},
${deaths}
);`;
  await db.run(sqlQuery1);

  response.send("District Successfully Added");
});
///get district

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtQuery = `SELECT * FROM district WHERE district_id=${districtId};`;
  const districtDetails = await db.get(districtQuery);
  response.send(districtDetails);
});
//delete
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM district WHERE district_id=${districtId};`;
  const deletedistrict = await db.run(deleteQuery);
  response.send("District Removed");
});
//UPDATE
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateQuery = `UPDATE district 
  SET 
  district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    ;`;
  await db.run(updateQuery);
  response.send("District Details Updated");
});
//statistics
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statsQuery = `SELECT 
    SUM(cases)  
    ,SUM(cured) ,
    SUM(active)  ,
    SUM(deaths)  
    FROM 
    district 
    WHERE state_id=${stateId};`;
  const stats = await db.get(statsQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],

    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});
///details
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateidQuery = `SELECT state_id FROM district WHERE district_id=${districtId};`;
  const statenameQuery = `SELECT state_name FROM state WHERE state_id=${stateidQuery.state_id};`;
  const stateName = await db.get(statenameQuery);
  response.send(stateName);
});
module.exports = app;
