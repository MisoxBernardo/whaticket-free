"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("MassMessages", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            whatsappId: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true
            },
            message: {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: false
            },
            phone: {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: false
            },
            status: {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "pending"
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable("SettingMessage");
    }
};
