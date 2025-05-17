"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TournamentList } from "@/components/tournament-list"

export default function ProfilePage() {
  const [user, setUser] = useState(null);
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
        setUser(data);
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

      {user.team && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Team</h2>
          <p><strong>Team Name:</strong> {user.team.name}</p>
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