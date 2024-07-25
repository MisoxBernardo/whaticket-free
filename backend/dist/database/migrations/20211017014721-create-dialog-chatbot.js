"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("DialogChatBots", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            awaiting: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            contactId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Contacts", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            chatbotId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Chatbots", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable("DialogChatBots");
    }
};
