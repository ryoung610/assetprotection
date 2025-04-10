import React, { useState, useEffect } from "react";
import { fetchAuthSession, updateUserAttributes, updatePassword } from "aws-amplify/auth";
import { uploadData, getUrl } from "aws-amplify/storage";
import "@aws-amplify/ui-react/styles.css";

function ProfilePage() {
  const [user, setUser] = useState<{ username: string; customUsername?: string } | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await fetchAuthSession();
        console.log("Full Session:", session); // Debug entire session object
        const payload = session.tokens?.idToken?.payload;
        console.log("ID Token Payload:", payload); // Debug payload

        if (!session.tokens || !payload) {
          throw new Error("No valid session or payload found");
        }

        const username = (payload["sub"] || payload["email"]) as string;
        if (!username) throw new Error("No username found in sub or email");

        setUser({
          username,
          customUsername: payload["custom:customUsername"] as string,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data. Are you signed in?");
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadProfilePic = async () => {
      if (user) {
        const fileName = `profile-pics/${user.username}_profile_pic`;
        try {
          const { url } = await getUrl({ key: fileName });
          setProfilePicUrl(url.toString());
        } catch (err) {
          console.log("No existing profile picture found:", err);
        }
      }
    };
    loadProfilePic();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file && user) {
      const fileName = `profile-pics/${user.username}_profile_pic`;
      try {
        await uploadData({
          key: fileName,
          data: file,
          options: { contentType: file.type },
        }).result;
        const { url } = await getUrl({ key: fileName });
        setProfilePicUrl(url.toString());
        setFile(null);
        console.log("Profile picture uploaded successfully");
      } catch (err: any) {
        setError(`Error uploading profile picture: ${err.message || err}`);
        console.error("Upload error:", err);
      }
    } else {
      setError("No file selected or user not authenticated");
    }
  };

  const handleUsernameUpdate = async () => {
    if (newUsername && user) {
      try {
        await updateUserAttributes({
          userAttributes: { "custom:customUsername": newUsername },
        });
        setUser({ ...user, customUsername: newUsername });
        setNewUsername("");
        setEditMode(false);
      } catch (err) {
        setError("Error updating username");
        console.error(err);
      }
    }
  };

  const handlePasswordUpdate = async () => {
    if (oldPassword && newPassword) {
      try {
        await updatePassword({ oldPassword, newPassword });
        setOldPassword("");
        setNewPassword("");
        setEditMode(false);
      } catch (err) {
        setError("Error updating password");
        console.error(err);
      }
    }
  };

  if (!user && error) return <p>{error}</p>; // Show error if user fails to load
  if (!user) return <p>Loading user...</p>;

  return (
    <div>
      <h2>Profile Page</h2>
      <div>
        <p>Welcome, {user.customUsername || user.username}</p>
        {profilePicUrl ? (
          <img src={profilePicUrl} alt="Profile" style={{ width: "150px" }} />
        ) : (
          <p>No profile picture uploaded.</p>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!file}>
            {profilePicUrl ? "Update Profile Picture" : "Upload Profile Picture"}
          </button>
        </div>

        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel" : "Edit Profile"}
        </button>

        {editMode && (
          <div>
            <div>
              <label htmlFor="newUsername">New Username:</label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <button onClick={handleUsernameUpdate} disabled={!newUsername}>
                Update Username
              </button>
            </div>

            <div>
              <label htmlFor="oldPassword">Old Password:</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                onClick={handlePasswordUpdate}
                disabled={!oldPassword || !newPassword}
              >
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;