"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Whatsapps", "thursday", {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Whatsapps", "thursday");
    }
};
