// src/pages/Settings.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Upload } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface ProfileData {
  name: string;
  bio: string;
  category: string;
  contact: string;
  socials: { url: string }[];
  avatar?: File | string;
}

const Settings: React.FC = () => {
  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileData>({
    defaultValues: {
      name: "",
      bio: "",
      category: "",
      contact: "",
      socials: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socials",
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/influencer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Cast res.data as ProfileData
        const data = res.data as ProfileData;

        reset({
          name: data.name,
          bio: data.bio || "",
          category: data.category || "",
          contact: data.contact || "",
          socials: (data.socials || []).map((urlObj) =>
            typeof urlObj === "string" ? { url: urlObj } : urlObj
          ),
        });

        if (data.avatar) {
          setAvatarPreview(data.avatar as string);
        }
      } catch (err) {
        toast.error("Failed to load profile.");
      }
    };

    if (token) fetchProfile();
  }, [token, reset]);

  const onSubmit = async (data: ProfileData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "socials") {
          formData.append("socials", JSON.stringify(value.map((s: { url: any; }) => s.url)));
        } else if (key === "avatar" && value instanceof File) {
          formData.append("avatar", value);
        } else {
          formData.append(key, value as string);
        }
      });

      await axios.put("http://localhost:5000/api/influencer/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("avatar", file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-lg mt-12">
      <Toaster position="top-right" />
      <h2 className="text-4xl font-bold mb-8 text-gray-900 tracking-tight">
        Profile Settings
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Avatar
              </div>
            )}
          </div>
          <label className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            <Upload size={18} />
            Upload Avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Full Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">Name is required</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Category</label>
            <input
              {...register("category", { required: true })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Fashion, Tech..."
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">Category is required</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">Bio</label>
            <textarea
              {...register("bio")}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">Contact Email</label>
            <input
              {...register("contact", {
                required: true,
                pattern: /^\S+@\S+\.\S+$/,
              })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">Enter a valid email</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <label className="block mb-2 font-medium text-gray-700">Social Profiles</label>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  {...register(`socials.${index}.url`, {
                    required: true,
                    pattern: /^https?:\/\/.+/,
                  })}
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourlink.com"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ url: "" })}
            className="flex items-center gap-2 mt-4 text-blue-600 hover:underline"
          >
            <Plus size={18} /> Add Social Link
          </button>
        </div>

        <div className="mt-10 border-t pt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
