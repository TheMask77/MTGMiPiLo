"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TournamentList } from "@/components/tournament-list"
import { getUserTournaments } from "../actions/tournament-actions";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await res.json();
        console.log("Fetched user data:", data); 
        setUser(data);

        if (data.team) {
          const teammatesRes = await fetch("/api/teams/teammates");
          if (!teammatesRes.ok) {
            throw new Error("Failed to fetch teammates");
          }
          const teammatesData = await teammatesRes.json();
          setTeammates(teammatesData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p className="p-4 text-center">Loading...</p>;
  }

  if (error) {
    return <p className="p-4 text-center text-red-500">{error}</p>;
  }

  if (!user) {
    return <p className="p-4 text-center">No user data available.</p>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">User Info</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      
      {!user.team && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Join a Team</h2>
          <p className="mb-2">You are not currently in a team. Join or create one now!</p>
          <a href="/teams">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to Teams Page
            </button>
          </a>
        </div>
      )}

      {user.team && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Team</h2>
          <p><strong>Team Name:</strong> {user.team.name}</p>

          {teammates.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Teammates</h3>
              <ul className="list-disc list-inside">
                {teammates.map((teammate) => (
                  <li key={teammate.id}>{teammate.username}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4">No teammates found.</p>
          )}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Tournaments Played</h2>
        {user.tournaments.length > 0 ? (
          <CardContent>
            <TournamentList tournaments={user.tournaments} />
          </CardContent>
        ) : (
          <p>No tournaments played yet.</p>
        )}
      </div>
    </div>
  );
}