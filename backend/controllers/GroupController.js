const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const Message = require("../models/Message");
const User = require("../models/User");
const { Op } = require("sequelize");

exports.createGroup = async (req, res) => {
  const { name, creatorId } = req.body;
  try {
    const group = await Group.create({ name, creatorId });

    await GroupMember.create({
      groupId: group.id,
      userId: creatorId,
      isAdmin: true,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.makeAdmin = async (req, res) => {
  const { groupId, userId } = req.params;
  const adminId = req.body.adminId;

  try {
    const currentAdmin = await GroupMember.findOne({
      where: { groupId, userId: adminId, isAdmin: true },
    });

    if (!currentAdmin) {
      return res
        .status(403)
        .json({ error: "You are not an admin of this group" });
    }

    const member = await GroupMember.update(
      { isAdmin: true },
      {
        where: { groupId, userId },
      }
    );

    if (!member) {
      return res.status(404).json({ error: "User not found in this group" });
    }

    res.status(200).json({ message: "User promoted to admin" });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.inviteUser = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  const adminId = req.body.adminId;
  try {
    const admin = await GroupMember.findOne({
      where: { groupId, userId: adminId, isAdmin: true },
    });

    if (!admin) {
      return res.status(403).json({ error: "Only admins can invite users" });
    }

    const existingMember = await GroupMember.findOne({
      where: { groupId, userId },
    });
    if (existingMember) {
      return res.status(400).json({ error: "User is already in the group" });
    }

    await GroupMember.create({ groupId, userId });

    await Message.create({
      message: `${adminId} has joined`,
      senderId: adminId,
      groupId,
    });

    res.status(201).json({ message: "User invited successfully" });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.removeUser = async (req, res) => {
  const { groupId, userId } = req.params;
  const adminId = req.body.adminId;

  try {
    const admin = await GroupMember.findOne({
      where: { groupId, userId: adminId, isAdmin: true },
    });

    if (!admin) {
      return res.status(403).json({ error: "Only admins can remove users" });
    }

    await GroupMember.destroy({ where: { groupId, userId } });
    res.status(200).json({ message: "User removed from the group" });
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Group,
          as: "groups",
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.sendMessage = async (req, res) => {
  try {
    const { message, userId, senderId } = req.body;
    const { groupId } = req.params;
    if (!message || !userId || !groupId || !senderId) {
      return res
        .status(400)
        .json({
          error: "Message, User ID, Group ID, and Sender ID are required",
        });
    }
    const isMember = await GroupMember.findOne({ where: { userId, groupId } });
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "User is not a member of the group" });
    }
    const newMessage = await Message.create({
      message,
      userId,
      groupId,
      senderId,
    });
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.findAll({
      where: { groupId },
      include: [{ model: User, as: "user" }],
      order: [["createdAt", "ASC"]],
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: ["id", "name", "email", "phone"],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.query;

  try {
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email"],
          through: {
            attributes: ["isAdmin"],
          },
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const membersWithStatus = group.members.map((member) => ({
      ...member.toJSON(),
      isAdmin: member.GroupMember.isAdmin,
    }));

    const userInGroup = membersWithStatus.find(
      (member) => member.id === parseInt(userId, 10)
    );
    const userIsAdmin = userInGroup ? userInGroup.isAdmin : false;
    console.log("User is Admin:", userIsAdmin);

    res.json({ members: membersWithStatus, userIsAdmin });
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ error: "Failed to fetch group members" });
  }
};
exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.query;

  try {
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email"],
          through: {
            attributes: ["isAdmin"],
          },
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const membersWithStatus = group.members.map((member) => ({
      ...member.toJSON(),
      isAdmin: member.GroupMember.isAdmin,
    }));

    const userInGroup = membersWithStatus.find(
      (member) => member.id === parseInt(userId, 10)
    );
    const userIsAdmin = userInGroup ? userInGroup.isAdmin : false;

    console.log(`User ID: ${userId}, Is Admin: ${userIsAdmin}`);

    res.json({ members: membersWithStatus, userIsAdmin });
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ error: "Failed to fetch group members" });
  }
};
