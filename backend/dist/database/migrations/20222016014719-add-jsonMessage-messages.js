"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Messages", "dataJson", {
            type: sequelize_1.DataTypes.JSON
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Messages", "dataJson");
    }
};
