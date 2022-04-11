const Sequelize = require('sequelize');

module.exports = class User_Workspace extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            color: {
                type: Sequelize.STRING(10),
                allowNull: false,
            },
            nick: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscores: false,
            modelName: 'User_Workspace',
            tableName: 'user_workspaces',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.User_Workspace.belongsTo(db.Group, { foreignKey: 'group_id', targetKey: 'id' });
        db.User_Workspace.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
        db.User_Workspace.belongsTo(db.Workspace, { foreignKey: 'workspace_id', targetKey: 'id' });
    }
};