const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const category = connect.define('category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    categoryName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryStatus: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'inactive',
    },
});

module.exports = category;
