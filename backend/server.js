const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const sequelize = require('./utils/database');
const Message = require('./models/Message');
const User = require('./models/User');
const Group = require('./models/Group');
const GroupMember = require('./models/GroupMember'); 
const authRoutes = require('./routes/auth'); 
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/groupRoutes'); 

User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId', as: 'groups' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', as: 'members' });

User.hasMany(Group, { foreignKey: 'creatorId', as: 'createdGroups' });
Group.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Group.hasMany(Message, { foreignKey: 'groupId', as: 'messages' });
Message.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

GroupMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);

wss.on("connection", (ws) => {
    ws.on("message", async (messageData) => {
        try {
            const data = JSON.parse(messageData);
            const { message, username, userId, groupId } = data;

            if (!userId || !groupId) {
                throw new Error("userId and groupId are required");
            }

            await Message.create({ message, userId, groupId });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ message: `${username}: ${message}`, groupId }));
                }
            });
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
sequelize.sync({ force: false }).then(() => {
    console.log('Database synchronized');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
