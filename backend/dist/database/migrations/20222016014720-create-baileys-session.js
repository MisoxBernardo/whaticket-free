"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("BaileysSessions", {
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
            value: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
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
        return queryInterface.dropTable("Baileys");
    }
};
