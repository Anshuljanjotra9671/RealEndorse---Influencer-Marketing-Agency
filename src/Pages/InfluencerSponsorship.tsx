import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

const InfluencerSponsorship: React.FC = () => {
  const [brand, setBrand] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("influencerToken");
    try {
      await axios.post(
        "http://localhost:5000/api/influencer/sponsorship/request",
        { brand, details },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSent("Submitted — our team will contact you!");
      setBrand("");
      setDetails("");
    } catch {
      setSent("Failed to submit — try again");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Apply for Sponsorship</h1>
      <p className="mb-5 text-gray-700 text-sm">We'll match you with platforms and brands who pay for sponsored posts even if you aren't picked for a campaign!</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          className="w-full border rounded p-2"
          placeholder="Target Brand/Industry"
          value={brand}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBrand(e.target.value)}
        />
        <textarea
          required
          className="w-full border rounded p-2"
          placeholder="Tell us about your audience and why you want sponsorship (100 chars min)"
          rows={4}
          minLength={100}
          value={details}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Submit</button>
      </form>
      {sent && <div className="mt-4 text-green-700">{sent}</div>}
    </div>
  );
};

export default InfluencerSponsorship;
