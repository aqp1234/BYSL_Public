const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Workspace = require('./workspace');
const User_Workspace = require('./user_workspace');
const Solo_Workspace = require('./solo_workspace');
const Group = require('./group');
const Permission = require('./permission');
const Group_Permission = require('./group_permission');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Workspace = Workspace;
db.User_Workspace = User_Workspace;
db.Solo_Workspace = Solo_Workspace;
db.Group = Group;
db.Permission = Permission;
db.Group_Permission = Group_Permission;

User.init(sequelize);
Workspace.init(sequelize);
User_Workspace.init(sequelize);
Solo_Workspace.init(sequelize);
Group.init(sequelize);
Permission.init(sequelize);
Group_Permission.init(sequelize);

User.associate(db);
Workspace.associate(db);
User_Workspace.associate(db);
Solo_Workspace.associate(db);
Group.associate(db);
Permission.associate(db);
Group_Permission.associate(db);

module.exports = db;