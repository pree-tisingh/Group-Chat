import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GroupComponent.css"; 
import ChatComponent from "./ChatDashboard";

const GroupComponent = ({ userId }) => {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/groups/user/${userId}/groups`
        );
        setGroups(res.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [userId]);
  useEffect(() => {
    if (selectedGroupId) {
      const fetchGroupMembers = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/groups/${selectedGroupId}/members`,
            { params: { userId } } 
          );
          console.log("Fetched Members:", res.data.members);
          console.log("Is Admin Status:", res.data.userIsAdmin); 
  
          setGroupMembers(res.data.members || []);
          setIsAdmin(res.data.userIsAdmin);
        } catch (error) {
          console.error("Error fetching group members:", error);
        }
      };
      fetchGroupMembers();
    }
  }, [selectedGroupId, userId]);

  const searchUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/groups/search-users`,
        {
          params: { query: searchTerm },
        }
      );
      setSearchResults(res.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  
  const inviteUser = async (userIdToInvite) => {
    try {
      await axios.post(
        `http://localhost:5000/api/groups/${selectedGroupId}/invite`,
        { userId: userIdToInvite, adminId: userId }
      );
      alert("User invited successfully!");
    } catch (error) {
      console.error("Error inviting user:", error);
    }
  };

  const promoteToAdmin = async (memberId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/groups/${selectedGroupId}/make-admin/${memberId}`,
        { adminId: userId }
      );
      alert("User promoted to admin!");
    } catch (error) {
      console.error("Error promoting user:", error);
    }
  };

  const removeUser = async (memberId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/groups/${selectedGroupId}/remove/${memberId}`,
        { data: { adminId: userId } }
      );
      alert("User removed from group!");
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  return (
    <div className="group-component">
      <h2>Chat-App</h2>

      <div className="groups-list">
        <h3>Groups</h3>
        {groups.length > 0 ? (
          <ul>
            {groups.map((group) => (
              <li key={group.id} onClick={() => setSelectedGroupId(group.id)}>
                {group.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No groups found.</p>
        )}
      </div>

      {selectedGroupId && (
        <>
          {isAdmin && (
            <div className="admin-actions">
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={searchUsers}>Search</button>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <h3>Search Results:</h3>
                  {searchResults.map((user) => (
                    <div key={user.id} className="user-item">
                      <span>
                        {user.name} - {user.email}
                      </span>
                      <button onClick={() => inviteUser(user.id)}>
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3>Group Members</h3>
          <div className="group-members">
            {groupMembers.map((member) => (
              <div key={member.id} className="member-item">
                <span>{member.name}</span>
                {isAdmin && ( 
                  <div className="admin-buttons">
                    <button onClick={() => promoteToAdmin(member.id)}>
                      Promote to Admin
                    </button>
                    <button onClick={() => removeUser(member.id)}>
                      Remove from Group
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <ChatComponent groupId={selectedGroupId} userId={userId} />
        </>
      )}
    </div>
  );
};

export default GroupComponent;
