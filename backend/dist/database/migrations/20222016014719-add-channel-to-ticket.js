"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Tickets", "channel", {
            type: sequelize_1.DataTypes.TEXT,
            defaultValue: "whatsapp",
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Tickets", "channel");
    }
};
