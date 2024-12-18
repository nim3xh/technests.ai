const models = require('../models');

function save(req, res){
    const todaystrade = {
        Date: req.body.Date,
        Time: req.body.Time,
        Direction: req.body.Direction
    };

    models.TodaysTrade.create(todaystrade)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while creating the TodaysTrade.'
        });
    });
}

function index(req, res){
    models.TodaysTrade.findAll()
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving TodaysTrade.'
        });
    });
}

function show(req, res){
    const id = req.params.id;

    models.TodaysTrade.findByPk(id)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || `Error retrieving TodaysTrade with id=${id}.`
        });
    });
}

function update(req, res){
    const id = req.params.id;

    models.TodaysTrade.update(req.body, {
        where: { id: id }
    })
    .then(num => {
        if (num == 1){
            res.send({
                message: 'TodaysTrade was updated successfully.'
            });
        } else {
            res.send({
                message: `Cannot update TodaysTrade with id=${id}. Maybe TodaysTrade was not found or req.body is empty!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || `Error updating TodaysTrade with id=${id}.`
        });
    });
}

function destroy(req, res){
    const id = req.params.id;

    models.TodaysTrade.destroy({
        where: { id: id }
    })
    .then(num => {
        if (num == 1){
            res.send({
                message: 'TodaysTrade was deleted successfully!'
            });
        } else {
            res.send({
                message: `Cannot delete TodaysTrade with id=${id}. Maybe TodaysTrade was not found!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || `Could not delete TodaysTrade with id=${id}.`
        });
    });
}

function destroyAll(req, res){
    models.TodaysTrade.destroy({
        where: {},
        truncate: false
    })
    .then(nums => {
        res.send({ message: `${nums} TodaysTrade were deleted successfully!` });
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while removing all TodaysTrade.'
        });
    });
}

module.exports = {
    save:save,
    index:index,
    show:show,
    update:update,
    destroy:destroy,
    destroyAll:destroyAll
};