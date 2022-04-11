const Sequelize = require('sequelize');

module.exports = class Workspace extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            workspacename: {
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
            modelName: 'Workspace',
            tableName: 'workspaces',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Workspace.hasMany(db.User_Workspace, { foreignKey: 'workspace_id', sourceKey: 'id' });
        db.Workspace.hasMany(db.Group, { foreignKey: 'workspace_id', sourceKey: 'id' });
        db.Workspace.belongsTo(db.User, { foreignKey: 'owner', targetKey: 'id' });
    }
};