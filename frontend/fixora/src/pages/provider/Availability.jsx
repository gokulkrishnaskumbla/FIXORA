import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProviderProfile,
  updateProviderAvailability,
} from "../../assistance/providerAssistance";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ProviderAvailability() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState({
    isAvailable: true,
    workingHours: { start: "09:00", end: "18:00" },
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  });

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        const response = await getProviderProfile();
        const provider = response.data?.provider;
        if (provider?.availability) {
          setAvailability({
            isAvailable: provider.availability.isAvailable,
            workingHours: {
              start: provider.availability.workingHours?.start || "09:00",
              end: provider.availability.workingHours?.end || "18:00",
            },
            workingDays: provider.availability.workingDays?.length
              ? provider.availability.workingDays
              : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          });
        }
      } catch (error) {
        console.error("Failed to load availability", error);
        toast.error("Unable to load availability", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  const toggleDay = (day) => {
    setAvailability((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProviderAvailability(availability);
      toast.success("Availability updated", { position: "top-right" });
    } catch (error) {
      console.error("Failed to update availability", error);
      const message = error.response?.data?.error || "Update failed";
      toast.error(message, { position: "top-right" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-base-100 rounded-xl shadow-lg p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-base-content mb-4">Availability Settings</h1>
      <p className="text-base-content/70 mb-6">
        Update your working schedule to receive service requests when convenient.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={availability.isAvailable}
            onChange={(event) =>
              setAvailability((prev) => ({ ...prev, isAvailable: event.target.checked }))
            }
          />
          <span className="font-semibold text-base-content">
            {availability.isAvailable ? "You are available for new requests" : "You are currently unavailable"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Working Hours - Start</label>
            <input
              type="time"
              className="input input-bordered w-full"
              value={availability.workingHours.start}
              onChange={(event) =>
                setAvailability((prev) => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, start: event.target.value },
                }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Working Hours - End</label>
            <input
              type="time"
              className="input input-bordered w-full"
              value={availability.workingHours.end}
              onChange={(event) =>
                setAvailability((prev) => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, end: event.target.value },
                }))
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const selected = availability.workingDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`btn btn-sm ${selected ? "btn-primary" : "btn-outline"}`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button className={`btn btn-primary ${saving ? "loading" : ""}`} type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}


