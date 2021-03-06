var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "CHRONOS_ITEM",
	properties: [
		{
			name: "Id",
			column: "ITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "TimesheetId",
			column: "ITEM_TIMESHEETID",
			type: "INTEGER",
		}, {
			name: "TaskId",
			column: "ITEM_TASKID",
			type: "INTEGER",
		}, {
			name: "Description",
			column: "ITEM_DESCRIPTION",
			type: "VARCHAR",
		}, {
			name: "Hours",
			column: "ITEM_HOURS",
			type: "INTEGER",
		}]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CHRONOS_ITEM",
		key: {
			name: "Id",
			column: "ITEM_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "CHRONOS_ITEM",
		key: {
			name: "Id",
			column: "ITEM_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CHRONOS_ITEM",
		key: {
			name: "Id",
			column: "ITEM_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM CHRONOS_ITEM");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("chronos-app/Timesheets/Item/" + operation).send(JSON.stringify(data));
}