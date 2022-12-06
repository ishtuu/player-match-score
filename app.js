const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;


const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertPlayerDetailDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDetailDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const convertMatchScoreDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.player_match_id,
    playerId: dbObject.player_id,
    matchId: dbObject.match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};

app.get("/players/", async (request, response) =>{
    const getPlayersQuery = `
        SELECT 
            *
        FROM
            player_details; `;
    const playerDetails = await database.all(getPlayersQuery)
    response.send(
        playerDetails.map((eachPlayer) => convertPlayerDetailDbObjectToResponseObject(eachPlayer)
        )
    )        
})

app.get("/players/:playerId/", async (request, response) =>{
    const { playerId } = request.params;
    const getPlayer = `
    select *
    from player_details
    where player_id = ${playerId};`;
    const player = await database.get(getPlayer);
    response.send(convertPlayerDetailDbObjectToResponseObject(player))
})

app.put("/players/:playerId/", async (request, response) =>{
    const {playerName} = request.body;
    const { playerId } = request.params;
    const putPlayersDetail = `
        UPDATE
            player_details
        SET
             player_name = '${playerName}'
        WHERE   
            player_id = ${playerId};`;
          await database.run(putPlayersDetail);
          response.send("Player Details Updated");

})

app.get("/matches/:matchId/", async (request, response) =>{
    const { matchId } = request.params;
    const getMatch = `
    select *
    from match_details
    where match_id = ${matchId};`;
    const match = await database.get(getMatch);
    response.send(convertMatchDetailDbObjectToResponseObject(match))
})

app.get("/players/:playerId/matches", async (request, response) =>{
     const { playerId } = request.params;
     const getPlayerMatch = `
     SELECT
        match_id AS matchId, match, year
     FROM 
        player_match_score
     NATURAL JOIN 
        match_details
     WHERE 
        player_id = ${playerId}; `;
     const playerMatch = await database.all(getPlayerMatch)
     response.send(playerMatch)
     console.log(playerMatch)

})

app.get("/matches/:matchId/players", async (request, response) =>{
     const { matchId } = request.params;
     const getPlayerMatch = `
     SELECT
        player_id AS playerId, player_name AS playerName
     FROM 
        player_match_score 
     NATURAL JOIN 
        player_details
     WHERE 
        match_id = ${matchId}; `;
     const playersMatch = await database.all(getPlayersMatch)
     response.send(playersMatch)
     console.log(playersMatch)

})

app.get("/players/:playerId/playerScores", async (request, response) =>{
    const { playerId } = request.params;
    const getPlayerScore = `
    SELECT
        player_id AS playerId, player_name AS playerName

    `
})


module.exports = app;
