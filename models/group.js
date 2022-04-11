const Sequelize = require('sequelize');

module.exports = class Group extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            name: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            is_admin: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            is_guest: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }
        }, {
            sequelize,
            timestamps: false,
            underscores: false,
            modelName: 'Group',
            tableName: 'groups',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Group.hasMany(db.Group_Permission, { foreignKey: 'group_id', sourceKey: 'id' });
        db.Group.belongsTo(db.Workspace, { foreignKey: 'workspace_id', targetKey: 'id' });
    }
};