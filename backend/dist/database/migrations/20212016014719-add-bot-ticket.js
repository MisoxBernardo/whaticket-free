"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Tickets", "isBot", {
            type: sequelize_1.DataTypes.BOOLEAN
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Tickets", "isBot");
    }
};
