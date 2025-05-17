"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function TeamsPage() {
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // for initial auth check

  useEffect(() => {
    // Check if user is logged in via /api/auth/me
    fetch("/api/auth/me")
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoadingAuth(false));
  }, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      });

      if (res.ok) {
        toast.success("Team created successfully!");
        setTeamName("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create team.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    const parsedId = parseInt(teamId, 10);
    if (isNaN(parsedId)) {
      toast.error("Please enter a valid numeric team ID.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: parsedId }),
      });

      if (res.ok) {
        toast.success("Joined team successfully!");
        setTeamId("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join team.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth) {
    return <p className="p-4 text-center">Checking authentication...</p>;
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Team Management</h1>
        <p className="text-gray-700">This page is for logged-in users only.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-4">Team Management</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Create a Team</h2>
        <label className="block mt-2">
          <span className="block mb-1">Team Name</span>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="w-full border rounded px-2 py-1"
            disabled={loading}
          />
        </label>
        <button
          onClick={handleCreateTeam}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Team"}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Join a Team</h2>
        <label className="block mt-2">
          <span className="block mb-1">Team ID</span>
          <input
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="Enter team ID"
            className="w-full border rounded px-2 py-1"
            disabled={loading}
          />
        </label>
        <button
          onClick={handleJoinTeam}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Joining..." : "Join Team"}
        </button>
      </div>
    </div>
  );
}
