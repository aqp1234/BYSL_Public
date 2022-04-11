const Sequelize = require('sequelize');

module.exports = class SoloWorkspace extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            solo_workspacename: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW,
            },
        }, {
            sequelize,
            timestamps: false,
            underscores: false,
            modelName: 'Solo_workspace',
            tableName: 'solo_workspaces',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Workspace.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
    }
};