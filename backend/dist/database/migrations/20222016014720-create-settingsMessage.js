"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("SettingMessages", {
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
            contacts: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            },
            photo: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            },
            random: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            },
            limit: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 10
            },
            minutes: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 1
            },
            seconds: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            sendToday: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            status: {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "active"
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
