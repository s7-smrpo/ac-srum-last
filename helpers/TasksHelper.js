const models = require('../models');

const Tasks = models.Tasks;
const User = models.User;
const Timetable = models.Timetable;

var sequelize = require('sequelize');
const ProjectHelper = require('../helpers/ProjectHelper');
const StoriesHelper = require('../helpers/StoriesHelper');
const SprintsHelper = require('../helpers/SprintsHelper');

var moment = require('moment');

async function listTasks(storyId) {
    return await Tasks.findAll( {
        where: {
            story_id: storyId,
        }
    });
}

async function listProjectTasks(projectId) {
    return await Tasks.findAll( {
        where: {
            project_id: projectId,
        }
    });
}

async function listUserTasks(userId) {
    return await Tasks.findAll({
        include: [
            {
                model: models.Stories,
                as: 'Story',
                attributes: ['id', 'sprint_id'],
            }
        ],
        where: {
            assignee: userId
        }
    });
}

async function getTask(taskId) {
    return await Tasks.findOne( {
        where: {
            id: taskId,
        }
    });
}

async function deleteTaskById(taskId) {
    if (!taskId) {
        return {msg: 'No Id specified..', payload: 1};
    }
    try {
        // !! - return true if successful, else false
        return !!await Tasks.destroy({
            where: {
                id: taskId
            },
            force:true,
        });
    } catch (e) {
        console.log("Can't delete " + e);
        return false;
    }
}

async function deleteTasksByStoryId(storyId) {
    if (!storyId) {
        return {msg: 'No Id specified..', payload: 1};
    }
    try {
        // !! - return true if successful, else false
        return !!await Tasks.destroy({
            where: {
                story_id: storyId
            }
        });
    } catch (e) {
        console.log("Can't delete " + e);
        return false;
    }
}

async function isValidTaskChange(task) {
    // Check if there is another task in the story with same name, case insensitive
    let existing = await Tasks.findAll({
        where: {
            story_id: task.story_id,
            name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), task.name.toLowerCase())
        }
    });

    //Name
    if (existing.length !== 0 && existing[0].id !== task.id) {
        return false;
    }
    //Story unrealised
    let story = await StoriesHelper.getStory(task.story_id);
    if (story.is_done || !story.sprint_id) {
        return false;
    }
    //In active sprint
    let sprint =  SprintsHelper.getSprint(story.sprint_id);
    if (!moment().isBetween(moment(sprint.startDate), moment(sprint.endDate), 'days', '[]')) {
        return false;
    }

    return true;
}

async function isPO(project_id, user_id) {
    let project = await ProjectHelper.getProjectToEdit(project_id);
    return user_id === project.product_owner;
}

async function checkIfSMorMember(req, res, next) {
    // check if user story is editable by SM or member

    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    let user = await User.findById(req.user.id);
    if (!user) {
        return res.redirect('/');
    }

    let projId = null;
    if (req.params.taskId) {
        let task = await getTask(req.params.taskId);
        projId = task.project_id;
    } else {
        projId = req.params.projectId;
    }

    if (!projId) {
        return res.redirect('/');
    }

    let project = await ProjectHelper.getProject(projId);
    let inProject = req.user.id === project.scrum_master;
    project.ProjectMembers.forEach(function (member) {
        if (req.user.id === member.id) {
            inProject = true;
        }
    });

    if (inProject) {
        return next();
    } else {
        return res.redirect('/');
    }
}

async function getTaskLoggedTimeArray(task) {
    let timetableArray = await Timetable.findAll({
        where: {
            task_id: task.id
        },
        order: [
            ['id', 'DESC']
        ],
    });

    return (timetableArray || []).map(x => x.dataValues)
        .map(x => {

            x.loggedTime = Math.round(  x.loggedTime * 100) / 100;
            return x;
        })
        .sort((a, b) => a.loggedDate -b.loggedDate);
}

async function setTaskLoggedTimeArray(task, times) {
    for (const time of times) {
        const createdTimetable = Timetable.build({
            remainingTime: time.remainingTime,
            loggedTime: time.loggedTime,
            loggedDate: time.loggedDate,
            autoLoggedDate: time.autoLoggedDate,
            task_id: task.id,
            loggedUser: time.assignee
        });

        await createdTimetable.save();
    }
}

async function deleteTaskLoggedTimes(task) {
    try {
        return !!await Timetable.destroy({
            where: {
                task_id: task.id
            }
        });
    } catch (e) {
        console.log("Can't delete " + e);
        return false;
    }
}

async function getTaskLoggedTime(task) {

    let timetableArray = await Timetable.findAll({
        where: {
            task_id: task.id
        },
        order: [
            ['id', 'DESC']
        ],
    });

    var tmpTime = 0;
    timetableArray.forEach(function (loggedTask) {
        // task je še v procesu logiranja časa
        if (loggedTask.dataValues.loggedDate.getTime() !== loggedTask.dataValues.autoLoggedDate.getTime()) {
            tmpTime = tmpTime + loggedTask.dataValues.loggedTime;
        }
    });

    return tmpTime;
}

module.exports = {
    getTaskLoggedTimeArray,
    deleteTaskLoggedTimes,
    setTaskLoggedTimeArray,
    listTasks,
    listProjectTasks,
    listUserTasks,
    getTask,
    deleteTaskById,
    deleteTasksByStoryId,
    isValidTaskChange,
    checkIfSMorMember,
    getTaskLoggedTime
};