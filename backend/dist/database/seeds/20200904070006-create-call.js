"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert("Settings", [
            {
                key: "call",
                value: "enabled",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },
    down: (queryInterface) => {
        return queryInterface.bulkDelete("Settings", {});
    }
};
