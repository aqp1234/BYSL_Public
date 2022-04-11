const Sequelize = require('sequelize');

module.exports = class Permission extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            content_type_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            codename: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscores: false,
            modelName: 'Permission',
            tableName: 'permissions',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Permission.hasMany(db.Group_Permission, { foreignKey: 'permission_id', sourceKey: 'id' });
    }
};