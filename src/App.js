import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import GroupSidebar from "./components/GroupSidebar";
import ChatComponent from "./components/ChatDashboard";
import './styles/global.css';

function App() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const userId = localStorage.getItem("userId"); 

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/groups"
          element={
            <div className="app-container" style={{ display: "flex" }}>
              <GroupSidebar userId={userId} selectGroup={setSelectedGroup} />
              {selectedGroup && (
                <ChatComponent groupId={selectedGroup} userId={userId} />
              )}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
