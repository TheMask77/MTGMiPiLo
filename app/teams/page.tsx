"use client";

import { useState } from "react";

export default function TeamsPage() {
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState("");

  const createTeam = async () => {
    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName }),
    });
    if (res.ok) {
      alert("Team created successfully!");
    } else {
      alert("Failed to create team");
    }
  };

  const joinTeam = async () => {
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: Number(teamId) }),
    });
    if (res.ok) {
      alert("Joined team successfully!");
    } else {
      alert("Failed to join team");
    }
  };

  return (
    <div>
      <h1>Team Management</h1>
      <div>
        <h2>Create a Team</h2>
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <button onClick={createTeam}>Create Team</button>
      </div>
      <div>
        <h2>Join a Team</h2>
        <input
          type="text"
          placeholder="Team ID"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        />
        <button onClick={joinTeam}>Join Team</button>
      </div>
    </div>
  );
}