const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
            },
            name: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            phone: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            school_code: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            school_name: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            location_code: {
                type: Sequelize.STRING(10),
                allowNull: true,
            },
            location_name: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            is_student: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                default: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscores: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.User.hasMany(db.Workspace, { foreignKey: 'owner', sourceKey: 'id' });
        db.User.hasMany(db.User_Workspace, { foreignKey: 'user_id', sourceKey: 'id' });
        db.User.hasMany(db.Solo_Workspace, { foreignKey: 'user_id', sourceKey: 'id' });
    }
};