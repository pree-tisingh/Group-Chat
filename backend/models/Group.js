const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./User'); 

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creatorId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'Groups',
  timestamps: true,
});


module.exports = Group;
