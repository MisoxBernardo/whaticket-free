"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("Chatbots", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            queueId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Queues", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            chatbotId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Chatbots", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            greetingMessage: {
                type: sequelize_1.DataTypes.TEXT
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
        return queryInterface.dropTable("Chatbots");
    }
};
