'use strict';
module.exports = (sequelize, DataTypes) => {
    var ProjectBacklog = sequelize.define('ProjectBacklog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

    });


    ProjectBacklog.associate = function (models) {
        models.ProjectBacklog.belongsTo(models.Project, {
            onDelete: "CASCADE",
            foreignKey: 'project_id',
            as: 'Project'
        });
        models.ProjectBacklog.belongsTo(models.User, {
            onDelete: "CASCADE",
            foreignKey: 'user_id',
            as: 'User'
        });
    };

    return ProjectBacklog;
};