const Sequelize = require('sequelize');

module.exports = class Group_Permission extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
        }, {
            sequelize,
            timestamps: false,
            underscores: false,
            modelName: 'Group_Permission',
            tableName: 'group_permissions',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Group_Permission.belongsTo(db.Group, { foreignKey: 'group_id', targetKey: 'id' });
        db.Group_Permission.belongsTo(db.Permission, { foreignKey: 'permission_id', targetKey: 'id' });
    }
};